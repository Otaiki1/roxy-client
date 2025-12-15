import * as linera from "@linera/client";

export class WasmManager {
  private static wasm: typeof linera | null = null;
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized && this.wasm) {
      return;
    }

    await linera.default();
    this.wasm = linera;
    this.initialized = true;
  }

  static getWasm(): typeof linera {
    if (!this.wasm || !this.initialized) {
      throw new Error("WASM not initialized. Call WasmManager.init() first.");
    }
    return this.wasm;
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}

