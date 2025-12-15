import * as linera from "@linera/client";
import { PrivateKey } from "@linera/signer";

export interface Request {
  type: "QUERY" | "MUTATION";
  applicationId: string;
  query: string;
}

export class ClientManager {
  private client: linera.Client | null = null;
  private wallet: linera.Wallet | null = null;
  public onNotificationCallback?: (data: any) => void;

  setWasmInstance(_wasm: typeof linera): void {
    // Method kept for interface compatibility
  }

  async init(
    _wasm: typeof linera,
    wallet: linera.Wallet,
    signer: PrivateKey
  ): Promise<void> {
    this.wallet = wallet;

    this.client = await new linera.Client(wallet, signer, false);
    this.registerNotificationHandler();
  }

  async query(req: Request): Promise<string> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    const app = await this.client.frontend().application(req.applicationId);
    const result = await app.query(req.query);
    return result;
  }

  async cleanup(): Promise<void> {
    // Cleanup client if needed
    this.client = null;
  }

  /**
   * Registers notification handler for blockchain events.
   * 
   * Note: You may see CORS and network errors in the browser console from the Linera client.
   * These are expected when:
   * - The validator node doesn't have CORS configured for localhost
   * - Network connectivity issues occur
   * - Background sync operations timeout
   * 
   * These errors don't affect functionality - the client handles them gracefully.
   * See src/lib/linera/ERRORS.md for more details.
   */
  private registerNotificationHandler(): void {
    if (!this.client) {
      return;
    }

    this.client.onNotification((notification: any) => {
      const parsed = this.parseNotification(notification);
      if (this.onNotificationCallback) {
        this.onNotificationCallback(parsed);
      }
    });
  }

  private parseNotification(notification: any): any {
    // Parse notification data as needed
    return notification;
  }

  async getBalance(): Promise<string | null> {
    if (!this.client || !this.wallet) {
      return null;
    }

    try {
      // Try to get balance from wallet if method exists
      if (typeof (this.wallet as any).balance === "function") {
        const balance = await (this.wallet as any).balance();
        return balance?.toString() || "0";
      }
      // Fallback: return 0 if balance method doesn't exist
      return "0";
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }
}

