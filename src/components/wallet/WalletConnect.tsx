import { useAuth } from "@/lib/linera/hooks/useAuth";
import { cn } from "@/utils/cn";

export function WalletConnect() {
    const {
        isLoading,
        isLoggedIn,
        isConnectedToLinera,
        isAppConnected,
        walletAddress,
        chainId,
        showConnectWallet,
        disconnect,
    } = useAuth();

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 border-brutal bg-black text-white">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono-brutal">Connecting...</span>
            </div>
        );
    }

    // Show connect button when not logged in
    if (!isLoggedIn) {
        return (
            <button
                onClick={showConnectWallet}
                className="px-4 py-2 border-brutal bg-primary text-black font-brutal hover:bg-primary/90 transition-colors"
            >
                Log In
            </button>
        );
    }

    // Show connection status when logged in
    const connectionStatus = isConnectedToLinera && isAppConnected;
    const statusColor = connectionStatus ? "bg-green-500" : "bg-yellow-500";
    const statusText = connectionStatus
        ? "Connected"
        : "Connecting to Linera...";

    return (
        <div className="flex items-center gap-3">
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 border-brutal bg-black text-white">
                <div className={cn("w-2 h-2 rounded-full", statusColor)} />
                <span className="text-xs font-mono-brutal">{statusText}</span>
            </div>

            {/* Wallet Address & Chain ID */}
            <div className="px-3 py-2 border-brutal bg-black text-white">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono-brutal">
                        {walletAddress
                            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                            : "No Address"}
                    </span>
                    {chainId && (
                        <span className="text-xs font-mono-brutal text-gray-400">
                            Chain: {chainId.slice(0, 8)}...{chainId.slice(-6)}
                        </span>
                    )}
                </div>
            </div>

            {/* Disconnect Button */}
            <button
                onClick={disconnect}
                className="px-3 py-2 border-brutal bg-red-600 text-white font-brutal hover:bg-red-700 transition-colors text-sm"
            >
                Disconnect
            </button>
        </div>
    );
}

