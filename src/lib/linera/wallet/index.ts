import * as linera from "@linera/client";
import { WasmManager } from "./wasmManager";
import { WalletManager } from "./walletManager";
import { ClientManager } from "./clientManager";
import type { Request } from "./clientManager";

// Re-export Request for use in other files
export type { Request };

export interface Result<T> {
  success: boolean;
  result?: T;
  error?: string;
}

export class Server {
  private static instance: Server | null = null;
  private wasmInstance: typeof linera | null = null;
  private wallet: WalletManager;
  private client: ClientManager;
  public onNotification?: (data: any) => void;

  private constructor() {
    this.wallet = new WalletManager();
    this.client = new ClientManager();
  }

  static async init(): Promise<Server> {
    if (!Server.instance) {
      const server = new Server();
      await server.setup();
      Server.instance = server;
    }
    return Server.instance;
  }

  private async setup(): Promise<void> {
    await WasmManager.init();
    this.wasmInstance = WasmManager.getWasm();
    this.wallet.setWasmInstance(this.wasmInstance);
    this.client.setWasmInstance(this.wasmInstance);
  }

  async create(fn: (data: any) => void): Promise<void> {
    this.onNotification = fn;
    await this._faucetAction("CREATE_WALLET");
  }

  async initClient(fn: (data: any) => void): Promise<void> {
    this.onNotification = fn;
    await this._initWallet();
    await this._initClient();
  }

  private async _initWallet(): Promise<void> {
    this.wallet.setWasmInstance(this.wasmInstance!);
    
    // Try to load existing wallet
    try {
      await this.wallet.load();
    } catch (error) {
      // If loading fails (no mnemonic), wallet will be created in _initClient
      // via the faucet
    }
  }

  private async _initClient(): Promise<void> {
    let wallet: linera.Wallet;
    let signer: any;
    
    try {
      // Try to get existing wallet and signer
      wallet = this.wallet.getWallet();
      signer = this.wallet.getSigner();
    } catch (error) {
      // If wallet doesn't exist, create it from faucet
      const faucetUrl = (import.meta as any).env.VITE_LINERA_FAUCET_URL || 
        "https://faucet.testnet-conway.linera.net/";
      const faucet = new linera.Faucet(faucetUrl);
      
      const { Wallet: EthersWallet } = await import("ethers");
      let mnemonic = localStorage.getItem("linera_mnemonic");
      if (!mnemonic) {
        const generated = EthersWallet.createRandom();
        const phrase = generated.mnemonic?.phrase;
        if (!phrase) {
          throw new Error("Failed to generate mnemonic");
        }
        mnemonic = phrase;
        localStorage.setItem("linera_mnemonic", mnemonic);
      }
      
      const { PrivateKey } = await import("@linera/signer");
      signer = PrivateKey.fromMnemonic(mnemonic);
      const address = await signer.address();
      
      wallet = await faucet.createWallet();
      this.wallet.setWallet(wallet);
      await this.wallet.create(wallet);
      
      await faucet.claimChain(wallet, address);
    }
    
    await this.client.init(
      this.wasmInstance!,
      wallet,
      signer
    );
    await this.wallet.reInitWallet();
    this.client.onNotificationCallback = this.onNotification;
  }

  private async _faucetAction(action: string): Promise<void> {
    const faucetUrl = (import.meta as any).env.VITE_LINERA_FAUCET_URL || 
      "https://faucet.testnet-conway.linera.net/";
    
    const faucet = new linera.Faucet(faucetUrl);

    if (action === "CREATE_WALLET") {
      await this.faucetHandlers.CREATE_WALLET(faucet);
    }
  }

  private faucetHandlers = {
    CREATE_WALLET: async (faucet: linera.Faucet) => {
      this.wallet.setWasmInstance(this.wasmInstance!);
      
      // Get or generate mnemonic
      let mnemonic = localStorage.getItem("linera_mnemonic");
      if (!mnemonic) {
        const { Wallet: EthersWallet } = await import("ethers");
        const generated = EthersWallet.createRandom();
        const phrase = generated.mnemonic?.phrase;
        if (!phrase) {
          throw new Error("Failed to generate mnemonic");
        }
        mnemonic = phrase;
        localStorage.setItem("linera_mnemonic", mnemonic);
      }
      
      const { PrivateKey } = await import("@linera/signer");
      const signer = PrivateKey.fromMnemonic(mnemonic);
      const address = await signer.address();
      
      const wallet = await faucet.createWallet();
      this.wallet.setWallet(wallet);
      await this.wallet.create(wallet);
      
      let chainId = await faucet.claimChain(wallet, address);

      await this._initClient();
      
      return { success: true, result: chainId };
    },
  };

  async request(req: Request): Promise<Result<string>> {
    try {
      const res = await this._handleQueryApplicationRequest(req);
      return { success: true, result: res as string };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async _handleQueryApplicationRequest(query: Request): Promise<string> {
    const result = await this.client.query(query);
    return result;
  }

  async JsWallet(): Promise<string> {
    return await this.wallet.JsWallet();
  }

  async getBalance(): Promise<string | null> {
    return await this.client.getBalance();
  }

  async setDefault(chainId: string): Promise<Result<string>> {
    try {
      const res = await this._handleSetDefaultChain(chainId);
      return { success: true, result: res as string };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async _handleSetDefaultChain(chainId: string): Promise<string> {
    const result = await this.wallet.setDefaultChain(chainId);
    await this.client.cleanup();
    await this._initClient();
    return result;
  }

  async assign(data: {
    chainId: string;
    timestamp: number;
  }): Promise<Result<string>> {
    try {
      const res = await this._handleAssignment(data);
      return { success: true, result: res as string };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async _handleAssignment(body: {
    chainId: string;
    timestamp: number;
  }): Promise<string> {
    const result = await this.wallet.assign(body);
    await this.client.cleanup();
    await this._initClient();
    return result;
  }
}

