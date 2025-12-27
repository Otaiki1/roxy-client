import * as lineraWeb from "@linera/client";
import {
    Client,
    Faucet,
    Wallet,
    Frontend,
} from "@linera/client";
import { DynamicSigner } from "./dynamic-signer";
import { LINERA_RPC_URL } from "../constants";
import { getCrossOriginStatus } from "../utils/crossOriginCheck";

export interface QueryResult<T = any> {
    data?: T;
    errors?: Array<{ message: string; [key: string]: any }>;
}

export class LineraAdapter {
    private static instance: LineraAdapter | null = null;
    private static wasmInitialized: boolean = false;
    private static wasmInitializing: Promise<void> | null = null;
    private isConnecting: boolean = false;
    private connectPromise: Promise<Client> | null = null;
    private client: Client | null = null;
    private frontend: Frontend | null = null;
    private wallet: Wallet | null = null;
    private chainId: string | null = null;
    private currentAppId: string | null = null;
    private previousAppIds: string[] = [];
    private notificationCallback: ((data: any) => void) | null = null;

    private constructor() {}

    /**
     * Initialize WASM module (must be called before using Linera)
     * @linera/client uses WebAssembly which needs to be initialized
     * The default export is the __wbg_init function
     */
    private static async initializeWasm(): Promise<void> {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:37',message:'initializeWasm() entry',data:{wasmInitialized:LineraAdapter.wasmInitialized,hasInitPromise:!!LineraAdapter.wasmInitializing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        if (LineraAdapter.wasmInitialized) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:42',message:'WASM already initialized - early return',data:{wasmInitialized:LineraAdapter.wasmInitialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            return;
        }

        // If already initializing, wait for that promise
        if (LineraAdapter.wasmInitializing) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:49',message:'WASM initialization already in progress - awaiting existing promise',data:{hasInitPromise:!!LineraAdapter.wasmInitializing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            await LineraAdapter.wasmInitializing;
            return;
        }

        // Create and immediately assign the initialization promise
        // In JavaScript's single-threaded execution model, this assignment is atomic
        // Concurrent async calls will see this assignment on their next check
        LineraAdapter.wasmInitializing = (async () => {
            try {
                console.log("Initializing Linera WASM...");
                
                // Check cross-origin isolation before initializing WASM
                const crossOriginStatus = getCrossOriginStatus();
                console.log("Cross-origin isolation status:", crossOriginStatus);
                
                if (!crossOriginStatus.isSupported) {
                    const errorMessage =
                        crossOriginStatus.errorMessage ||
                        "Cross-Origin Isolation is not enabled. Please configure your server to send COEP/COOP headers.";
                    console.error("Cross-origin isolation check failed:", errorMessage);
                    throw new Error(
                        `Linera WASM requires Cross-Origin Isolation. ${errorMessage}\n\n` +
                        `For production deployments, you need to configure your hosting platform to send these headers:\n` +
                        `- Cross-Origin-Opener-Policy: same-origin\n` +
                        `- Cross-Origin-Embedder-Policy: credentialless\n\n` +
                        `See: https://developer.mozilla.org/en-US/docs/Web/API/SharedArrayBuffer#security_requirements`
                    );
                }
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:59',message:'Starting WASM initialization',data:{hasDefault:typeof lineraWeb.default === 'function',lineraWebKeys:Object.keys(lineraWeb).slice(0,10),hasClient:!!(lineraWeb as any).Client,crossOriginStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                
                // The default export is the WASM init function (__wbg_init)
                if (typeof lineraWeb.default === "function") {
                    await lineraWeb.default();
                    
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:66',message:'WASM init function completed',data:{hasClient:!!(lineraWeb as any).Client,lineraWebKeys:Object.keys(lineraWeb).slice(0,20),clientType:typeof (lineraWeb as any).Client},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                    // #endregion
                    
                    LineraAdapter.wasmInitialized = true;
                    console.log("Linera WASM initialized successfully");
                } else {
                    throw new Error("Linera WASM init function not found");
                }
            } catch (error) {
                console.error("Failed to initialize Linera WASM:", error);
                LineraAdapter.wasmInitialized = false; // Reset flag on error
                throw new Error(`Linera WASM initialization failed: ${error}. Make sure the WASM file is accessible.`);
            } finally {
                // Clear the promise when done
                LineraAdapter.wasmInitializing = null;
            }
        })();

        // Await the promise we just created
        await LineraAdapter.wasmInitializing;
    }

    static getInstance(): LineraAdapter {
        if (!LineraAdapter.instance) {
            LineraAdapter.instance = new LineraAdapter();
        }
        return LineraAdapter.instance;
    }

    /**
     * Connect to Linera network using Dynamic wallet
     */
    async connect(
        dynamicWallet: any, // Dynamic wallet type from @dynamic-labs
        rpcUrl: string = LINERA_RPC_URL
    ): Promise<Client> {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:98',message:'connect() called',data:{isConnecting:this.isConnecting,hasClient:!!this.client,hasConnectPromise:!!this.connectPromise,walletAddress:dynamicWallet?.address},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

        // If already connected, return existing client
        if (this.client) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:104',message:'Already connected - returning existing client',data:{hasClient:!!this.client,chainId:this.chainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return this.client;
        }

        // If already connecting, return the existing promise
        if (this.isConnecting && this.connectPromise) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:110',message:'Connection already in progress - returning existing promise',data:{isConnecting:this.isConnecting,hasConnectPromise:!!this.connectPromise},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return this.connectPromise;
        }

        // Mark as connecting and create the connection promise
        this.isConnecting = true;
        this.connectPromise = (async () => {
            try {
                console.log("Connecting to Linera...");

                // Initialize WASM module first
                await LineraAdapter.initializeWasm();

            // Get the user's address from Dynamic wallet
            const address = dynamicWallet.address;
            if (!address) {
                throw new Error("No address found in Dynamic wallet");
            }

            // Create Faucet instance
            console.log("Creating Faucet instance...");
            const faucet = new Faucet(rpcUrl);

            // Create Linera wallet
            console.log("Creating Linera wallet...");
            this.wallet = await faucet.createWallet();

            // Claim chain for the user's address
            console.log("Claiming chain for address:", address);
            this.chainId = await faucet.claimChain(this.wallet, address);
            console.log("Chain claimed:", this.chainId);

            // Create Dynamic signer
            const signer = new DynamicSigner(dynamicWallet, address);

            // Create Linera client (skip_process_inbox = false)
            console.log("Creating Linera client...");
            console.log("Wallet type:", typeof this.wallet, this.wallet?.constructor?.name);
            console.log("Signer type:", typeof signer, signer?.constructor?.name);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:104',message:'Checking Client class availability',data:{lineraWebHasClient:!!(lineraWeb as any).Client,importedClientType:typeof Client,lineraWebKeys:Object.keys(lineraWeb)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // Use Client from the initialized WASM module (lineraWeb)
            // After initialization, classes should be available on lineraWeb
            // IMPORTANT: The imported Client might be just a type, we MUST use lineraWeb.Client
            const ClientClass = (lineraWeb as any).Client;
            
            if (!ClientClass) {
                console.error("Client class not found on lineraWeb after WASM initialization");
                console.error("lineraWeb keys:", Object.keys(lineraWeb));
                console.error("lineraWeb.Client:", (lineraWeb as any).Client);
                throw new Error("Client class not available on lineraWeb. WASM may not be properly initialized.");
            }
            
            console.log("Using Client class from WASM:", {
                ClientClassType: typeof ClientClass,
                ClientClassName: ClientClass?.name,
                isFunction: typeof ClientClass === "function",
            });
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:120',message:'ClientClass determined',data:{ClientClassType:typeof ClientClass,ClientClassName:ClientClass?.name,isFunction:typeof ClientClass === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // The Client constructor might return a Promise in some cases
            // Try to handle both sync and async cases
            let clientResult: any;
            try {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:110',message:'Before Client constructor call',data:{walletType:typeof this.wallet,signerType:typeof signer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                console.log("Creating Client with:", {
                    wallet: this.wallet,
                    signer: signer,
                    walletType: typeof this.wallet,
                    signerType: typeof signer,
                });
                
                clientResult = new ClientClass(this.wallet, signer, false);
                
                console.log("Client constructor result:", {
                    resultType: typeof clientResult,
                    isPromise: !!(clientResult && typeof clientResult.then === "function"),
                    constructor: clientResult?.constructor?.name,
                    hasFrontend: typeof clientResult?.frontend === "function",
                    hasFree: typeof clientResult?.free === "function",
                    allProperties: Object.getOwnPropertyNames(clientResult || {}),
                    prototypeMethods: clientResult ? Object.getOwnPropertyNames(Object.getPrototypeOf(clientResult)) : [],
                });
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:150',message:'After Client constructor call',data:{clientResultType:typeof clientResult,clientResultIsPromise:!!(clientResult && typeof clientResult.then === 'function'),clientResultConstructor:clientResult?.constructor?.name,hasFrontend:typeof clientResult?.frontend === 'function',hasFree:typeof clientResult?.free === 'function',allProperties:Object.getOwnPropertyNames(clientResult || {}).slice(0,20),prototypeMethods:clientResult ? Object.getOwnPropertyNames(Object.getPrototypeOf(clientResult)).slice(0,20) : []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                // If the constructor returns a Promise, await it
                if (clientResult && typeof clientResult.then === "function") {
                    console.log("Client constructor returned a Promise, awaiting...");
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:115',message:'Awaiting Promise from Client constructor',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    this.client = await clientResult;
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:116',message:'After awaiting Promise',data:{clientType:typeof this.client,clientConstructor:this.client?.constructor?.name,hasFrontend:typeof this.client?.frontend === 'function',hasFree:typeof this.client?.free === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                } else {
                    this.client = clientResult;
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:118',message:'Client assigned directly (not Promise)',data:{clientType:typeof this.client,clientConstructor:this.client?.constructor?.name,hasFrontend:typeof this.client?.frontend === 'function',hasFree:typeof this.client?.free === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                }
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:120',message:'Error creating Client',data:{errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : 'No stack'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                console.error("Error creating Client:", error);
                console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
                throw new Error(`Failed to create Linera client: ${error}`);
            }

            // Validate that client was created properly
            if (!this.client) {
                throw new Error("Failed to create Linera client: client is null or undefined");
            }

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:131',message:'Client created - checking methods',data:{clientType:typeof this.client,clientConstructor:this.client.constructor?.name,hasFrontend:typeof this.client.frontend === 'function',hasFree:typeof this.client.free === 'function',prototypeMethods:Object.getOwnPropertyNames(Object.getPrototypeOf(this.client)),ownProperties:Object.getOwnPropertyNames(this.client)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            // Log client details for debugging
            console.log("Client created:", {
                type: typeof this.client,
                constructor: this.client.constructor?.name,
                hasFrontend: typeof this.client.frontend === "function",
                hasFree: typeof this.client.free === "function",
                methods: Object.getOwnPropertyNames(Object.getPrototypeOf(this.client)),
            });

            // Wait a bit to ensure WASM is fully ready (sometimes needed)
            await new Promise(resolve => setTimeout(resolve, 100));

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:143',message:'After 100ms delay - checking frontend method',data:{hasFrontend:typeof this.client.frontend === 'function',hasFree:typeof this.client.free === 'function',clientType:typeof this.client},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion

            // Check if frontend method exists
            if (typeof this.client.frontend !== "function") {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:145',message:'Frontend method missing - detailed inspection',data:{clientObject:JSON.stringify(this.client,Object.getOwnPropertyNames(this.client).slice(0,20)),clientType:typeof this.client,clientConstructor:this.client.constructor?.name,prototypeMethods:Object.getOwnPropertyNames(Object.getPrototypeOf(this.client)),ownProperties:Object.getOwnPropertyNames(this.client)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                console.error("Client object:", this.client);
                console.error("Client type:", typeof this.client);
                console.error("Client constructor:", this.client.constructor?.name);
                console.error("Client prototype:", Object.getPrototypeOf(this.client));
                console.error("Client methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(this.client)));
                console.error("Client own properties:", Object.getOwnPropertyNames(this.client));
                throw new Error("Client.frontend is not a function. Client may not be properly initialized.");
            }

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:154',message:'Calling client.frontend()',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            // Get frontend from client
            this.frontend = this.client.frontend();

            // Set up notification listeners
            this.setupNotifications();

                console.log("Successfully connected to Linera");
                return this.client!;
            } catch (error) {
                console.error("Failed to connect to Linera:", error);
                this.reset();
                throw error;
            } finally {
                this.isConnecting = false;
                this.connectPromise = null;
            }
        })();

        return this.connectPromise;
    }

    /**
     * Set the application(s) to interact with
     */
    async setApplications(
        appId: string,
        previousAppIds: string[] = []
    ): Promise<void> {
        if (!this.client) {
            throw new Error("Not connected to Linera. Call connect() first.");
        }

        this.currentAppId = appId;
        this.previousAppIds = previousAppIds;

        console.log("Application set:", {
            current: appId,
            previous: previousAppIds,
        });
    }

    /**
     * Query the current application
     */
    async queryApplication<T = any>(
        query: { query: string; variables?: Record<string, any> }
    ): Promise<QueryResult<T>> {
        if (!this.frontend || !this.currentAppId) {
            throw new Error(
                "Not connected or application not set. Call connect() and setApplications() first."
            );
        }

        try {
            // Get application from frontend
            const application = await this.frontend.application(
                this.currentAppId
            );

            // Build query string - format as GraphQL JSON payload if variables exist
            let queryString = query.query;
            if (query.variables && Object.keys(query.variables).length > 0) {
                // Format as GraphQL JSON: {"query": "...", "variables": {...}}
                queryString = this.injectVariables(query.query, query.variables);
            }

            const resultString = await application.query(queryString);
            const result = JSON.parse(resultString) as QueryResult<T>;

            if (result.errors && result.errors.length > 0) {
                console.warn("Query errors:", result.errors);
            }

            return result;
        } catch (error) {
            console.error("Query error:", error);
            throw error;
        }
    }

    /**
     * Query current and previous applications
     */
    async queryCurrentAndPreviousApplications<T = any>(
        query: { query: string; variables?: Record<string, any> }
    ): Promise<QueryResult<T>[]> {
        if (!this.frontend || !this.currentAppId) {
            throw new Error(
                "Not connected or application not set. Call connect() and setApplications() first."
            );
        }

        const allAppIds = [this.currentAppId, ...this.previousAppIds];
        const results: QueryResult<T>[] = [];

        for (const appId of allAppIds) {
            try {
                const application = await this.frontend.application(appId);

                // Build query string - format as GraphQL JSON payload if variables exist
                let queryString = query.query;
                if (query.variables && Object.keys(query.variables).length > 0) {
                    queryString = this.injectVariables(
                        query.query,
                        query.variables
                    );
                }

                const resultString = await application.query(queryString);
                const result = JSON.parse(resultString) as QueryResult<T>;
                results.push(result);
            } catch (error) {
                console.error(`Query error for app ${appId}:`, error);
                results.push({
                    errors: [
                        {
                            message: `Failed to query application ${appId}: ${error}`,
                        },
                    ],
                });
            }
        }

        return results;
    }

    /**
     * Inject variables into GraphQL query string
     * Formats GraphQL query with variables as a JSON payload string
     */
    private injectVariables(
        query: string,
        variables: Record<string, any>
    ): string {
        // Format as GraphQL JSON payload: {"query": "...", "variables": {...}}
        const payload = {
            query: query.trim(),
            variables: variables,
        };
        return JSON.stringify(payload);
    }

    /**
     * Get the current client
     */
    getClient(): Client | null {
        return this.client;
    }

    /**
     * Check if chain is connected
     */
    isChainConnected(): boolean {
        return this.client !== null && this.frontend !== null;
    }

    /**
     * Check if application is set
     */
    isApplicationSet(): boolean {
        return this.currentAppId !== null;
    }

    /**
     * Get the current wallet address
     */
    getAddress(): string | null {
        // Address is stored in the Dynamic wallet, not in the adapter
        // This method is for compatibility
        return null;
    }

    /**
     * Get the current chain ID
     */
    getChainId(): string | null {
        return this.chainId;
    }

    /**
     * Subscribe to new block notifications
     */
    onNewBlockNotification(callback: (data: any) => void): void {
        this.notificationCallback = callback;
    }

    /**
     * Set up notification listeners
     */
    private setupNotifications(): void {
        if (!this.client) return;

        // Set up notification handler
        if (this.notificationCallback) {
            this.client.onNotification(this.notificationCallback);
        }
        console.log("Notification system set up");
    }

    /**
     * Reset and disconnect
     */
    reset(): void {
        try {
            if (this.client) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'linera-adapter.ts:354',message:'Reset - checking client.free method',data:{clientType:typeof this.client,hasFree:typeof this.client.free === 'function',clientConstructor:this.client.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                // Check if free method exists before calling
                if (typeof this.client.free === "function") {
                    this.client.free();
                } else {
                    console.warn("Client.free is not a function, skipping cleanup");
                }
            }
            if (this.frontend) {
                // Check if free method exists before calling
                if (typeof this.frontend.free === "function") {
                    this.frontend.free();
                } else {
                    console.warn("Frontend.free is not a function, skipping cleanup");
                }
            }
            if (this.wallet) {
                // Check if free method exists before calling
                if (typeof this.wallet.free === "function") {
                    this.wallet.free();
                } else {
                    console.warn("Wallet.free is not a function, skipping cleanup");
                }
            }
        } catch (error) {
            console.error("Error during reset:", error);
        } finally {
            this.client = null;
            this.frontend = null;
            this.wallet = null;
            this.chainId = null;
            this.currentAppId = null;
            this.previousAppIds = [];
            this.notificationCallback = null;
            this.isConnecting = false;
            this.connectPromise = null;
            console.log("Linera adapter reset");
        }
    }
}

// Export singleton instance
export const lineraAdapter = LineraAdapter.getInstance();

