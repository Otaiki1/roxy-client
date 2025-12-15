import { useEffect, useState, useContext } from "react";
import { toggleMockMode, isMockModeEnabled } from "@/services/mockMode";
import { WalletContext } from "@/context/WalletContext";

export function useMockMode() {
    // Safely access wallet context - may be undefined if provider not ready
    const walletContext = useContext(WalletContext);
    const isAuthenticated = walletContext?.isAuthenticated ?? false;
    
    const [enabled, setEnabled] = useState(false);

    // Auto-enable mock mode when not authenticated (for demo purposes)
    useEffect(() => {
        // Only run if context is available (provider is mounted)
        if (walletContext === undefined) {
            // Provider not ready yet, enable mock mode by default
            if (!isMockModeEnabled()) {
                toggleMockMode(true);
                setEnabled(true);
            }
            return;
        }

        const shouldEnable = !isAuthenticated;
        
        if (shouldEnable && !isMockModeEnabled()) {
            toggleMockMode(true);
            setEnabled(true);
        } else if (isAuthenticated && isMockModeEnabled()) {
            // Optionally disable when authenticated (or keep it running)
            // toggleMockMode(false);
            // setEnabled(false);
        }
    }, [isAuthenticated, walletContext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't stop on unmount - let it run in background
            // toggleMockMode(false);
        };
    }, []);

    const enable = () => {
        toggleMockMode(true);
        setEnabled(true);
    };

    const disable = () => {
        toggleMockMode(false);
        setEnabled(false);
    };

    return {
        enabled: enabled || isMockModeEnabled(),
        enable,
        disable,
        toggle: () => {
            if (isMockModeEnabled()) {
                disable();
            } else {
                enable();
            }
        },
    };
}

