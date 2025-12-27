import * as linera from "@linera/client";

export type Request = {
  type: "QUERY";
  applicationId: string;
  query: string;
};

export class ClientManager {
  public onNotificationCallback?: (data: any) => void;

  constructor() {}

  setWasmInstance(_wasmInstance: typeof linera): void {
    // Stub implementation
  }

  async init(
    _wasmInstance: typeof linera,
    _wallet: linera.Wallet,
    _signer: any
  ): Promise<void> {
    // Stub implementation
  }

  async query(_req: Request): Promise<string> {
    // Stub implementation
    return "";
  }

  async getBalance(): Promise<string | null> {
    // Stub implementation
    return null;
  }

  async cleanup(): Promise<void> {
    // Stub implementation
  }
}
