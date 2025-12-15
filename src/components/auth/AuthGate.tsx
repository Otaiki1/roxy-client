import type { PropsWithChildren } from "react";
import { useContext } from "react";
import { WalletContext } from "@/context/WalletContext";
import { ConnectWalletModal } from "@/components/modals/ConnectWalletModal";

export function AuthGate({ children }: PropsWithChildren) {
    // Safely access wallet context - may be undefined if provider not ready
    const walletContext = useContext(WalletContext);
    
    // Default to not authenticated if context not available
    const isAuthenticated = walletContext?.isAuthenticated ?? false;
    const isLineraReady = walletContext?.isLineraReady ?? false;

    const allowAccess = isAuthenticated && isLineraReady;

    return (
        <>
            {!allowAccess && <ConnectWalletModal forceOpen />}
            <div aria-hidden={!allowAccess} className={!allowAccess ? "blur-sm" : ""}>
                {children}
            </div>
        </>
    );
}

