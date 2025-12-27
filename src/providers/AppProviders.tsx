import type { PropsWithChildren } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    DYNAMIC_SANDBOX_ENVIRONMENT_ID,
    DYNAMIC_LIVE_ENVIRONMENT_ID,
} from "@/lib/linera/constants";

// Create a query client instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

export function AppProviders({ children }: PropsWithChildren) {
    const isProduction = import.meta.env.PROD;
    const environmentId = isProduction
        ? DYNAMIC_LIVE_ENVIRONMENT_ID
        : DYNAMIC_SANDBOX_ENVIRONMENT_ID;

    return (
        <DynamicContextProvider
            theme="auto"
            settings={{
                environmentId,
                walletConnectors: [EthereumWalletConnectors],
                appName: "Roxy Client",
            }}
        >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </DynamicContextProvider>
    );
}

