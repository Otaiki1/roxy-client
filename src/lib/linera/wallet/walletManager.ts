import * as linera from "@linera/client";

export class WalletManager {
  private wallet: linera.Wallet | null = null;
  private signer: any = null;

  constructor() {}

  setWasmInstance(_wasmInstance: typeof linera): void {
    // Stub implementation
  }

  async load(): Promise<void> {
    // Stub implementation
    throw new Error("Not implemented");
  }

  getWallet(): linera.Wallet {
    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }
    return this.wallet;
  }

  getSigner(): any {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }
    return this.signer;
  }

  async setWallet(wallet: linera.Wallet): Promise<void> {
    this.wallet = wallet;
  }

  async create(wallet: linera.Wallet): Promise<void> {
    this.wallet = wallet;
  }

  async reInitWallet(): Promise<void> {
    // Stub implementation
  }

  async JsWallet(): Promise<string> {
    // Stub implementation
    return "";
  }

  async setDefaultChain(_chainId: string): Promise<string> {
    // Stub implementation
    return "";
  }

  async assign(_body: { chainId: string; timestamp: number }): Promise<string> {
    // Stub implementation
    return "";
  }
}
