import type { Signer } from "@linera/client";

/**
 * DynamicSigner bridges Dynamic wallets with Linera's signing requirements.
 * 
 * Important: The value parameter is already pre-hashed by Linera.
 * We use personal_sign directly, NOT signMessage() (which would double-hash).
 */
export class DynamicSigner implements Signer {
    private dynamicWallet: any; // Dynamic wallet type from @dynamic-labs
    private address: string;

    constructor(dynamicWallet: any, address: string) {
        this.dynamicWallet = dynamicWallet;
        this.address = address;
    }

    async sign(owner: string, value: Uint8Array): Promise<string> {
        // Verify the owner matches the wallet address
        if (owner.toLowerCase() !== this.address.toLowerCase()) {
            throw new Error(
                `Owner mismatch: expected ${this.address}, got ${owner}`
            );
        }

        // Convert Uint8Array to hex string
        const msgHex = `0x${this.uint8ArrayToHex(value)}`;

        try {
            // Use personal_sign (NOT signMessage - avoids double-hashing)
            const walletClient = await this.dynamicWallet.getWalletClient();
            const signature = await walletClient.request({
                method: "personal_sign",
                params: [msgHex, this.address],
            });

            return signature as string;
        } catch (error) {
            console.error("Signing error:", error);
            throw new Error(`Failed to sign message: ${error}`);
        }
    }

    async containsKey(owner: string): Promise<boolean> {
        // Check if the owner matches the wallet address
        return owner.toLowerCase() === this.address.toLowerCase();
    }

    private uint8ArrayToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
}

