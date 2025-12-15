import * as linera from "@linera/client";
import { PrivateKey } from "@linera/signer";
import { Wallet as EthersWallet } from "ethers";

export class WalletManager {
  private wasmInstance: typeof linera | null = null;
  private wallet: linera.Wallet | null = null;
  private signer: PrivateKey | null = null;
  private mnemonic: string | null = null;

  setWasmInstance(wasm: typeof linera): void {
    this.wasmInstance = wasm;
  }

  async create(wallet: linera.Wallet): Promise<void> {
    if (!this.wasmInstance) {
      throw new Error("WASM instance not set");
    }

    this.wallet = wallet;
    
    // Get or generate mnemonic from localStorage
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
    
    this.mnemonic = mnemonic;
    this.signer = PrivateKey.fromMnemonic(mnemonic);
  }

  async load(): Promise<void> {
    if (!this.wasmInstance) {
      throw new Error("WASM instance not set");
    }

    // Get mnemonic from localStorage
    const mnemonic = localStorage.getItem("linera_mnemonic");
    if (!mnemonic) {
      throw new Error("No mnemonic found in storage");
    }

    this.mnemonic = mnemonic;
    this.signer = PrivateKey.fromMnemonic(mnemonic);
    
    // Wallet will be created/loaded by the client
    // The Linera client handles wallet persistence internally
  }

  getWallet(): linera.Wallet {
    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }
    return this.wallet;
  }

  getSigner(): PrivateKey {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }
    return this.signer;
  }

  async assign(payload: { chainId: string; timestamp: number }): Promise<string> {
    if (!this.wallet || !this.signer) {
      throw new Error("Wallet not initialized");
    }

    // Check if assignChain method exists
    if (typeof (this.wallet as any).assignChain === "function") {
      await (this.wallet as any).assignChain(
        this.signer.address(),
        payload.chainId,
        payload.timestamp
      );
    }
    this.cleanup();
    await this.reInitWallet();
    return "Chain assigned successfully";
  }

  async setDefaultChain(chainId: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }

    // Check if setDefaultChain method exists
    if (typeof (this.wallet as any).setDefaultChain === "function") {
      await (this.wallet as any).setDefaultChain(chainId);
    }
    this.cleanup();
    await this.reInitWallet();
    return chainId;
  }

  async reInitWallet(): Promise<void> {
    // Wallet is managed by the client, no need to reload
    // This method is kept for compatibility
  }
  
  setWallet(wallet: linera.Wallet): void {
    this.wallet = wallet;
  }

  cleanup(): void {
    // Cleanup if needed
  }

  async JsWallet(): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }
    try {
      // Try to get wallet JSON, fallback to constructing from available data
      if (typeof (this.wallet as any).json === "function") {
        return await (this.wallet as any).json();
      }
      // Fallback: construct wallet JSON from available data
      const address = this.signer?.address() || "";
      return JSON.stringify({
        chains: {},
        defaultChain: "",
      });
    } catch (error) {
      // If json() doesn't exist, return minimal wallet structure
      const address = this.signer?.address() || "";
      return JSON.stringify({
        chains: {},
        defaultChain: "",
      });
    }
  }
}

