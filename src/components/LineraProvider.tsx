import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import * as linera from "@linera/client";
import { PrivateKey } from "@linera/signer";
import { Wallet } from "ethers";

interface LineraContextType {
    client?: linera.Client;
    wallet?: linera.Wallet;
    chainId?: string;
    application?: linera.Application;
    accountOwner?: string;
    ready: boolean;
    error?: Error;
    reinitializeClient?: () => Promise<void>;
}

const LineraContext = createContext<LineraContextType>({ ready: false });

export const useLinera = () => useContext(LineraContext);

export function LineraProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<LineraContextType>({ ready: false });
    const initRef = useRef(false);
    const reinitCooldownRef = useRef<number>(0);

    const reinitializeClient = async () => {
        const now = Date.now();
        if (now - reinitCooldownRef.current < 5000) {
            // Throttle re-initialization attempts to every 5s
            return;
        }
        reinitCooldownRef.current = now;

        const doReinit = async (attempt = 0): Promise<void> => {
            try {
                // Re-init WASM module (best-effort)
                try {
                    await linera.default();
                } catch {}

                const faucetUrl = (import.meta as any).env
                    .VITE_LINERA_FAUCET_URL;
                const applicationId = (import.meta as any).env
                    .VITE_LINERA_APPLICATION_ID;

                if (!faucetUrl || !applicationId) {
                    throw new Error("Missing Linera env configuration");
                }

                const generated = Wallet.createRandom();
                const phrase = generated.mnemonic?.phrase;
                if (!phrase) throw new Error("Failed to generate mnemonic");

                localStorage.setItem("linera_mnemonic", phrase);

                const signer = PrivateKey.fromMnemonic(phrase);
                const faucet = new linera.Faucet(faucetUrl);
                const owner = signer.address();

                // Add timeout wrapper for faucet operations
                const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
                    return Promise.race([
                        promise,
                        new Promise<T>((_, reject) =>
                            setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms. Please check your network connection and try again.`)), timeoutMs)
                        ),
                    ]);
                };

                console.log("[LineraProvider] Creating wallet via faucet...");
                const wallet = await withTimeout(
                    faucet.createWallet(),
                    60000, // 60 second timeout
                    "Wallet creation"
                );
                console.log("[LineraProvider] Wallet created, claiming chain...");
                
                const chainId = await withTimeout(
                    faucet.claimChain(wallet, owner),
                    60000, // 60 second timeout
                    "Chain claiming"
                );
                console.log("[LineraProvider] Chain claimed:", chainId);

                const clientInstance = await new linera.Client(
                    wallet,
                    signer,
                    true // Disable background sync to prevent infinite loading
                );

                const application = await clientInstance
                    .frontend()
                    .application(applicationId);

                setState({
                    client: clientInstance,
                    wallet,
                    chainId,
                    application,
                    accountOwner: owner,
                    ready: true,
                    error: undefined,
                    reinitializeClient,
                });
            } catch (error) {
                const msg = String((error as any)?.message || error);
                console.error("[LineraProvider] Reinitialization error:", error);
                
                // Retry once on characteristic WASM memory abort signatures
                if (
                    attempt === 0 &&
                    (msg.includes("RuntimeError") ||
                        msg.includes("unreachable") ||
                        msg.includes("malloc"))
                ) {
                    console.log("[LineraProvider] Retrying after WASM error...");
                    await new Promise((r) => setTimeout(r, 300));
                    return doReinit(1);
                }

                // Provide more helpful error messages
                let errorMessage = msg;
                if (msg.includes("timed out")) {
                    errorMessage = `Connection timeout: ${msg}. The Linera faucet may be slow or unreachable. Please check your internet connection and try again.`;
                } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
                    errorMessage = `Network error: Unable to reach the Linera faucet. Please check your internet connection and ensure the faucet URL is correct.`;
                } else if (msg.includes("Missing Linera env")) {
                    errorMessage = `Configuration error: ${msg}. Please check your environment variables.`;
                }

                setState((prev) => ({
                    ...prev,
                    ready: false,
                    error: new Error(errorMessage),
                }));
            }
        };

        return doReinit(0);
    };

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        (async () => {
            try {
                // Initialize Linera WASM module
                await linera.default();

                // Get environment variables
                const faucetUrl = (import.meta as any).env
                    .VITE_LINERA_FAUCET_URL;
                const applicationId = (import.meta as any).env
                    .VITE_LINERA_APPLICATION_ID;

                if (!faucetUrl || !applicationId) {
                    throw new Error("Missing Linera env configuration");
                }

                // Get or generate mnemonic
                let mnemonic = localStorage.getItem("linera_mnemonic");
                if (!mnemonic) {
                    const generated = Wallet.createRandom();
                    const phrase = generated.mnemonic?.phrase;
                    if (!phrase) throw new Error("Failed to generate mnemonic");
                    mnemonic = phrase;
                    localStorage.setItem("linera_mnemonic", mnemonic);
                }

                // Create signer from mnemonic
                const signer = PrivateKey.fromMnemonic(mnemonic);
                const faucet = new linera.Faucet(faucetUrl);
                const owner = signer.address();

                // Add timeout wrapper for faucet operations
                const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
                    return Promise.race([
                        promise,
                        new Promise<T>((_, reject) =>
                            setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms. Please check your network connection and try again.`)), timeoutMs)
                        ),
                    ]);
                };

                console.log("[LineraProvider] Step 1/5: Creating wallet via faucet...");
                const startTime = Date.now();
                const wallet = await withTimeout(
                    faucet.createWallet(),
                    60000, // 60 second timeout
                    "Wallet creation"
                );
                console.log(`[LineraProvider] ✓ Wallet created in ${Date.now() - startTime}ms`);
                
                console.log("[LineraProvider] Step 2/5: Claiming chain...");
                const claimStartTime = Date.now();
                const chainId = await withTimeout(
                    faucet.claimChain(wallet, owner),
                    60000, // 60 second timeout
                    "Chain claiming"
                );
                console.log(`[LineraProvider] ✓ Chain claimed: ${chainId} (took ${Date.now() - claimStartTime}ms)`);

                console.log("[LineraProvider] Step 3/5: Initializing Linera client...");
                const clientStartTime = Date.now();
                // Disable background sync to prevent infinite loading
                // Background sync is not required for basic functionality (queries/mutations work without it)
                // Set to true to DISABLE background sync (confusing naming in Linera SDK)
                const clientInstance = await new linera.Client(
                    wallet,
                    signer,
                    true // disable_background_sync = true (background sync DISABLED)
                );
                console.log(`[LineraProvider] ✓ Client initialized (took ${Date.now() - clientStartTime}ms)`);
                console.log("[LineraProvider] Background sync disabled - app will work without full blockchain sync");

                console.log("[LineraProvider] Step 4/5: Connecting to application...");
                const appStartTime = Date.now();
                let application: linera.Application | undefined;
                try {
                    application = await withTimeout(
                        clientInstance.frontend().application(applicationId),
                        45000, // 45 second timeout for application connection (allows time for blob downloads)
                        "Application connection"
                    );
                    console.log(`[LineraProvider] ✓ Application connected (took ${Date.now() - appStartTime}ms)`);
                } catch (appError) {
                    // If application connection times out, still mark as ready with a warning
                    console.warn("[LineraProvider] ⚠️ Application connection timed out after 45s");
                    console.warn("[LineraProvider] Marking as ready anyway - app will retry connection when needed");
                    // Try to get application again in background (non-blocking)
                    clientInstance.frontend().application(applicationId).then((app) => {
                        console.log("[LineraProvider] ✓ Application connected");
                        setState((prev) => ({ ...prev, application: app }));
                    }).catch((err) => {
                        console.warn("[LineraProvider] Application connection still pending:", err);
                    });
                }

                console.log("[LineraProvider] Step 5/5: Finalizing setup...");
                // Mark as ready even if background sync is still running
                // Background sync will continue in the background but app is usable
                setState({
                    client: clientInstance,
                    wallet,
                    chainId,
                    application,
                    accountOwner: owner,
                    ready: true,
                    error: undefined,
                    reinitializeClient,
                });
                console.log(`[LineraProvider] ✓ Setup complete! Total time: ${Date.now() - startTime}ms`);
                console.log(`[LineraProvider] Chain ID: ${chainId}`);
                console.log(`[LineraProvider] Account: ${owner}`);
                if (!application) {
                    console.log("[LineraProvider] ⚠️ Application connection pending - will retry when needed");
                }

                console.log("[LineraProvider] Step 5/5: Finalizing setup...");
                // Mark as ready even if background sync is still running
                // Background sync will continue in the background but app is usable
                setState({
                    client: clientInstance,
                    wallet,
                    chainId,
                    application,
                    accountOwner: owner,
                    ready: true,
                    error: undefined,
                    reinitializeClient,
                });
                console.log(`[LineraProvider] ✓ Setup complete! Total time: ${Date.now() - startTime}ms`);
                console.log(`[LineraProvider] Chain ID: ${chainId}`);
                console.log(`[LineraProvider] Account: ${owner}`);
                console.log("[LineraProvider] Background sync will continue downloading blobs - this is normal and doesn't block the app");
            } catch (error) {
                const msg = String((error as any)?.message || error);
                console.error("[LineraProvider] Initialization error:", error);
                
                // Provide more helpful error messages
                let errorMessage = msg;
                if (msg.includes("timed out")) {
                    errorMessage = `Connection timeout: ${msg}. The Linera faucet may be slow or unreachable. Please check your internet connection and try again.`;
                } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
                    errorMessage = `Network error: Unable to reach the Linera faucet. Please check your internet connection and ensure the faucet URL is correct.`;
                } else if (msg.includes("Missing Linera env")) {
                    errorMessage = `Configuration error: ${msg}. Please check your environment variables.`;
                }
                
                setState({ ready: false, error: new Error(errorMessage) });
            }
        })();
    }, []);

    // Auto re-init on specific global WASM memory abort errors
    useEffect(() => {
        const errorHandler = (evt: ErrorEvent) => {
            const txt = String(evt.message || "");
            const filename = String(evt.filename || "");
            const stack = String(evt.error?.stack || "");
            const errorName = String(evt.error?.name || "");
            
            // Check for WASM panics - can appear in message, filename, or stack
            const isWasmAbort =
                (txt.includes("linera_web_bg.wasm") || 
                 filename.includes("linera_web") ||
                 stack.includes("linera_web") ||
                 stack.includes("wasm-function") ||
                 txt.includes("panicked at") ||
                 txt.includes("Option::unwrap")) &&
                (txt.includes("RuntimeError") ||
                    txt.includes("unreachable") ||
                    txt.includes("malloc") ||
                    txt.includes("panicked") ||
                    txt.includes("Option::unwrap") ||
                    errorName === "RuntimeError");
            
            // Also catch panics that mention Linera WASM in stack trace
            const isLineraPanic = 
                (txt.includes("unreachable") && (stack.includes("linera") || stack.includes("wasm"))) ||
                (txt.includes("RuntimeError") && (stack.includes("linera") || stack.includes("wasm"))) ||
                (txt.includes("panicked") && (stack.includes("linera") || stack.includes("wasmer") || stack.includes("wasm"))) ||
                (txt.includes("Option::unwrap") && (stack.includes("linera") || stack.includes("wasm")));
            
            if (isWasmAbort || isLineraPanic) {
                // Suppress the error from console since we're handling it
                evt.preventDefault();
                evt.stopPropagation();
                // Only log in development mode with more detail
                if (import.meta.env.DEV) {
                    console.debug("[Linera] WASM panic detected and handled (this is expected during initialization)");
                }
                // Fire-and-forget reinitialization
                reinitializeClient?.().catch(() => {});
                return false; // Prevent default error handling
            }
        };

        // Handle unhandled promise rejections from Linera client background sync
        // These are expected when offline or validator is unreachable
        const rejectionHandler = (evt: PromiseRejectionEvent) => {
            const reason = evt.reason;
            const msg = String(reason?.message || reason || "");
            const reasonStr = String(reason || "");
            const stack = String(reason?.stack || "");
            const errorName = String(reason?.name || "");
            
            // Suppress network errors from Linera client background tasks
            // These are expected when offline or validator is unreachable
            const isNetworkError = 
                msg.includes("ERR_INTERNET_DISCONNECTED") ||
                msg.includes("Failed to fetch") ||
                msg.includes("NetworkError") ||
                msg.includes("DownloadBlob") ||
                msg.includes("DownloadRawCertificatesByHeights") ||
                msg.includes("synchronize_chain_state");
            
            // Detect WASM panic errors that should trigger reinitialization
            // Check message, stack, and error name
            const isWasmPanic = 
                msg.includes("unreachable") ||
                msg.includes("RuntimeError") ||
                msg.includes("panicked") ||
                msg.includes("Option::unwrap") ||
                msg.includes("linera_web") ||
                reasonStr.includes("unreachable") ||
                reasonStr.includes("RuntimeError") ||
                reasonStr.includes("panicked") ||
                reasonStr.includes("linera_web") ||
                stack.includes("linera_web") ||
                stack.includes("wasm-function") ||
                stack.includes("wasmer") ||
                errorName === "RuntimeError";
            
            if (isNetworkError) {
                // Suppress network errors - they're expected in background sync
                evt.preventDefault(); // Prevent default unhandled rejection behavior
                evt.stopPropagation();
                // Only log in development mode
                if (import.meta.env.DEV) {
                    console.debug("[Linera] Background sync network error (expected):", reason);
                }
                return false;
            } else if (isWasmPanic) {
                // WASM panics should trigger reinitialization
                evt.preventDefault(); // Prevent default unhandled rejection behavior
                evt.stopPropagation();
                // Only log in development mode with minimal detail
                if (import.meta.env.DEV) {
                    console.debug("[Linera] WASM panic in promise (handled, reinitializing)");
                }
                // Trigger reinitialization
                reinitializeClient?.().catch(() => {});
                return false;
            }
        };

        window.addEventListener("error", errorHandler);
        window.addEventListener("unhandledrejection", rejectionHandler);
        
        return () => {
            window.removeEventListener("error", errorHandler);
            window.removeEventListener("unhandledrejection", rejectionHandler);
        };
    }, []);

    return (
        <LineraContext.Provider value={state}>
            {children}
        </LineraContext.Provider>
    );
}

