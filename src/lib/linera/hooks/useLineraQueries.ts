import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { LineraService } from "../services/LineraService";

/**
 * Hook to check if Linera is initialized
 */
export function useLineraInitialization() {
    const { isConnectedToLinera, isAppConnected } = useAuth();

    return {
        isInitialized: isConnectedToLinera && isAppConnected,
        isConnectedToLinera,
        isAppConnected,
    };
}

/**
 * Hook to get wallet information
 */
export function useWallet() {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "wallet"],
        queryFn: () => service.getWalletInfo(),
        enabled: isConnectedToLinera,
        staleTime: Infinity, // Wallet info doesn't change
    });
}

/**
 * Hook to fetch player data
 */
export function usePlayer(playerId: string | null) {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "player", playerId],
        queryFn: () => {
            if (!playerId) throw new Error("Player ID is required");
            return service.getPlayer(playerId);
        },
        enabled: !!playerId && isConnectedToLinera,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to fetch player total points
 */
export function usePlayerTotalPoints(playerId: string | null) {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "player", playerId, "totalPoints"],
        queryFn: () => {
            if (!playerId) throw new Error("Player ID is required");
            return service.getPlayerTotalPoints(playerId);
        },
        enabled: !!playerId && isConnectedToLinera,
        staleTime: 30 * 1000,
    });
}

/**
 * Hook to fetch daily prediction outcome
 */
export function useDailyOutcome(playerId: string | null) {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "player", playerId, "dailyOutcome"],
        queryFn: () => {
            if (!playerId) throw new Error("Player ID is required");
            return service.getDailyOutcome(playerId);
        },
        enabled: !!playerId && isConnectedToLinera,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Hook to fetch weekly prediction outcome
 */
export function useWeeklyOutcome(playerId: string | null) {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "player", playerId, "weeklyOutcome"],
        queryFn: () => {
            if (!playerId) throw new Error("Player ID is required");
            return service.getWeeklyOutcome(playerId);
        },
        enabled: !!playerId && isConnectedToLinera,
        staleTime: 60 * 1000,
    });
}

/**
 * Hook to fetch monthly prediction outcome
 */
export function useMonthlyOutcome(playerId: string | null) {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "player", playerId, "monthlyOutcome"],
        queryFn: () => {
            if (!playerId) throw new Error("Player ID is required");
            return service.getMonthlyOutcome(playerId);
        },
        enabled: !!playerId && isConnectedToLinera,
        staleTime: 60 * 1000,
    });
}

/**
 * Hook to fetch global leaderboard
 */
export function useGlobalLeaderboard() {
    const { isConnectedToLinera } = useAuth();
    const service = LineraService.getInstance();

    return useQuery({
        queryKey: ["linera", "globalLeaderboard"],
        queryFn: () => service.getGlobalLeaderboard(),
        enabled: isConnectedToLinera,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Combined hook for Linera operations
 */
export function useLineraOperations() {
    const auth = useAuth();
    const initialization = useLineraInitialization();
    const wallet = useWallet();

    return {
        ...auth,
        ...initialization,
        walletInfo: wallet.data,
    };
}
