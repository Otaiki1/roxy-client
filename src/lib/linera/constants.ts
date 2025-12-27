// Linera network RPC URL
export const LINERA_RPC_URL =
    import.meta.env.VITE_LINERA_RPC_URL ||
    "https://faucet.testnet-conway.linera.net/";

// Current application ID (predictive_manager contract)
export const PREDICTIVE_MANAGER_APP_ID =
    import.meta.env.VITE_LINERA_APP_ID ||
    "b69f00dde98964b2d09b4aad4c8a7162c81fe19dc176e9c1431dc8ab1b87e03c";

// Previous application IDs (for historical queries)
export const PREVIOUS_APP_IDS = import.meta.env.VITE_LINERA_PREVIOUS_APP_IDS
    ? import.meta.env.VITE_LINERA_PREVIOUS_APP_IDS.split(",").map(
          (id: string) => id.trim()
      )
    : [];

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use PREDICTIVE_MANAGER_APP_ID instead */
export const GOL_APP_ID = PREDICTIVE_MANAGER_APP_ID;
/** @deprecated Use PREVIOUS_APP_IDS instead */
export const PREVIOUS_GOL_APP_IDS = PREVIOUS_APP_IDS;

// Dynamic wallet environment IDs
export const DYNAMIC_SANDBOX_ENVIRONMENT_ID =
    import.meta.env.VITE_DYNAMIC_SANDBOX_ENVIRONMENT_ID ||
    "1b431ade-9f8b-409d-9ca8-74b4cd7132b4";

export const DYNAMIC_LIVE_ENVIRONMENT_ID =
    import.meta.env.VITE_DYNAMIC_LIVE_ENVIRONMENT_ID ||
    "1b431ade-9f8b-409d-9ca8-74b4cd7132b4";
