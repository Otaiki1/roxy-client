import { useEffect, useState } from "react";
import { toggleMockMode, isMockModeEnabled } from "@/services/mockMode";

export function useMockMode() {
    const [enabled, setEnabled] = useState(false);

    // Auto-enable mock mode by default (for demo purposes)
    useEffect(() => {
        if (!isMockModeEnabled()) {
            toggleMockMode(true);
            setEnabled(true);
        }
    }, []);

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

