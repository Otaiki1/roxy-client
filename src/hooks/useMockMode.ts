import { useEffect, useState } from "react";
import { toggleMockMode, isMockModeEnabled } from "@/services/mockMode";
import { useWallet } from "@/context/WalletContext";

export function useMockMode() {
    const { isAuthenticated } = useWallet();
    const [enabled, setEnabled] = useState(false);

    // Auto-enable mock mode when not authenticated (for demo purposes)
    useEffect(() => {
        const shouldEnable = !isAuthenticated;
        
        if (shouldEnable && !isMockModeEnabled()) {
            toggleMockMode(true);
            setEnabled(true);
        } else if (isAuthenticated && isMockModeEnabled()) {
            // Optionally disable when authenticated (or keep it running)
            // toggleMockMode(false);
            // setEnabled(false);
        }
    }, [isAuthenticated]);

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

