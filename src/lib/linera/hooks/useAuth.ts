import { useEffect, useState, useCallback, useRef } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { LineraService } from "../services/LineraService";
import { lineraAdapter } from "../lib/linera-adapter";

export function useAuth() {
    const { primaryWallet, setShowAuthFlow, user } = useDynamicContext();

    // Check if user is authenticated
    const isAuthenticated = !!user && !!primaryWallet;

    const [isLoading, setIsLoading] = useState(false);
    const [isConnectedToLinera, setIsConnectedToLinera] = useState(false);
    const [isAppConnected, setIsAppConnected] = useState(false);

    // Use ref to track initialization attempt to prevent redundant calls
    const initAttemptedRef = useRef<string | null>(null);
    const currentWalletAddress = primaryWallet?.address || null;

    // Initialize Linera connection when wallet is connected
    useEffect(() => {
        let cancelled = false;

        const initializeLinera = async () => {
            if (!primaryWallet || !user) {
                setIsConnectedToLinera(false);
                setIsAppConnected(false);
                initAttemptedRef.current = null;
                return;
            }

            // Check if already connected to avoid unnecessary re-initialization
            if (
                lineraAdapter.isChainConnected() &&
                lineraAdapter.isApplicationSet()
            ) {
                setIsConnectedToLinera(true);
                setIsAppConnected(true);
                initAttemptedRef.current = currentWalletAddress;
                return;
            }

            // Skip if we've already attempted initialization for this wallet
            if (initAttemptedRef.current === currentWalletAddress) {
                // #region agent log
                fetch(
                    "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            location: "useAuth.ts:44",
                            message:
                                "Skipping initialization - already attempted for this wallet",
                            data: {
                                walletAddress: currentWalletAddress,
                                attemptedFor: initAttemptedRef.current,
                            },
                            timestamp: Date.now(),
                            sessionId: "debug-session",
                            runId: "run1",
                            hypothesisId: "A",
                        }),
                    }
                ).catch(() => {});
                // #endregion
                return;
            }

            // Mark that we're attempting initialization for this wallet
            initAttemptedRef.current = currentWalletAddress;

            // #region agent log
            fetch(
                "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "useAuth.ts:20",
                        message:
                            "useEffect triggered - starting initialization",
                        data: {
                            hasPrimaryWallet: !!primaryWallet,
                            isAuthenticated: !!user,
                            walletAddress: primaryWallet?.address,
                            alreadyConnected: lineraAdapter.isChainConnected(),
                        },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "A",
                    }),
                }
            ).catch(() => {});
            // #endregion

            setIsLoading(true);
            try {
                const service = LineraService.getInstance();
                await service.initialize(primaryWallet);

                // Check if effect was cancelled before updating state
                if (cancelled) {
                    // #region agent log
                    fetch(
                        "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                location: "useAuth.ts:32",
                                message:
                                    "Effect cancelled - skipping state update",
                                data: {},
                                timestamp: Date.now(),
                                sessionId: "debug-session",
                                runId: "run1",
                                hypothesisId: "B",
                            }),
                        }
                    ).catch(() => {});
                    // #endregion
                    return;
                }

                setIsConnectedToLinera(lineraAdapter.isChainConnected());
                setIsAppConnected(lineraAdapter.isApplicationSet());

                // #region agent log
                fetch(
                    "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            location: "useAuth.ts:40",
                            message:
                                "Initialization successful - state updated",
                            data: {
                                isConnectedToLinera:
                                    lineraAdapter.isChainConnected(),
                                isAppConnected:
                                    lineraAdapter.isApplicationSet(),
                            },
                            timestamp: Date.now(),
                            sessionId: "debug-session",
                            runId: "run1",
                            hypothesisId: "A",
                        }),
                    }
                ).catch(() => {});
                // #endregion
            } catch (error) {
                console.error("Failed to initialize Linera:", error);
                if (!cancelled) {
                    setIsConnectedToLinera(false);
                    setIsAppConnected(false);
                    // Reset the ref on error so initialization can be retried
                    if (initAttemptedRef.current === currentWalletAddress) {
                        initAttemptedRef.current = null;
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    // Update connection state
                    const isConnected = lineraAdapter.isChainConnected();
                    const isAppSet = lineraAdapter.isApplicationSet();
                    setIsConnectedToLinera(isConnected);
                    setIsAppConnected(isAppSet);
                } else {
                    // If cancelled, reset the ref so initialization can be retried
                    if (initAttemptedRef.current === currentWalletAddress) {
                        initAttemptedRef.current = null;
                    }
                }
            }
        };

        initializeLinera();

        // Cleanup function to mark effect as cancelled
        return () => {
            // #region agent log
            fetch(
                "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "useAuth.ts:58",
                        message: "useEffect cleanup - marking as cancelled",
                        data: {},
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "B",
                    }),
                }
            ).catch(() => {});
            // #endregion
            cancelled = true;
        };
        // Use primaryWallet and user directly instead of isAuthenticated to avoid dependency issues
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryWallet, user]);

    const showConnectWallet = useCallback(() => {
        setShowAuthFlow(true);
    }, [setShowAuthFlow]);

    const disconnect = useCallback(async () => {
        try {
            const service = LineraService.getInstance();
            service.disconnect();
            setIsConnectedToLinera(false);
            setIsAppConnected(false);
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    }, []);

    const walletAddress = primaryWallet?.address || null;
    const chainId = lineraAdapter.getChainId();

    return {
        isLoading,
        isLoggedIn: isAuthenticated,
        isConnectedToLinera,
        isAppConnected,
        walletAddress,
        chainId,
        showConnectWallet,
        disconnect,
        primaryWallet,
        user,
    };
}
