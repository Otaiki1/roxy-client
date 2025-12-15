import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";

import { useLinera } from "@/components/LineraProvider";

interface WalletContextValue {
    isAuthenticated: boolean;
    isLineraReady: boolean;
    isLoading: boolean;
    address?: string;
    chainId?: string;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    error?: string;
}

export const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: PropsWithChildren) {
    const {
        ready,
        accountOwner,
        chainId,
        error: lineraError,
        reinitializeClient,
    } = useLinera();
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Map LineraProvider state to WalletContext API
    const isAuthenticated = ready && !!accountOwner;
    const isLineraReady = ready;
    const isLoading = !ready && !lineraError;
    const address = accountOwner;
    const error = lineraError?.message;

    const connect = useCallback(async () => {
        if (ready) {
            // Already connected, no-op
            return;
        }

        if (isReconnecting) {
            return;
        }

        setIsReconnecting(true);
        try {
            if (reinitializeClient) {
                await reinitializeClient();
            }
        } catch (err) {
            // Error is handled by LineraProvider state
            console.error("[WalletContext] Reconnection failed:", err);
        } finally {
            setIsReconnecting(false);
        }
    }, [ready, reinitializeClient, isReconnecting]);

    const disconnect = useCallback(async () => {
        // Clear mnemonic from localStorage to force new wallet on next connect
        localStorage.removeItem("linera_mnemonic");
        // Reload page to reset state
        window.location.reload();
    }, []);

    const value = useMemo<WalletContextValue>(
        () => ({
            isAuthenticated,
            isLineraReady,
            isLoading: isLoading || isReconnecting,
            address,
            chainId,
            connect,
            disconnect,
            error,
        }),
        [
            address,
            chainId,
            connect,
            disconnect,
            error,
            isAuthenticated,
            isLineraReady,
            isLoading,
            isReconnecting,
        ]
    );

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const ctx = useContext(WalletContext);
    if (!ctx) {
        throw new Error("useWallet must be used within WalletProvider");
    }
    return ctx;
};

