/**
 * TypeScript types for the predictive_manager Linera contract
 */

export type PriceOutcome = "Rise" | "Fall" | "Neutral";

/**
 * Player data from GraphQL query
 */
export interface Player {
    id: string; // Player ID (chain address)
    displayName: string | null;
    tokenBalance: string; // Amount as string
    level: number;
    experiencePoints: number;
    totalEarned: string; // Amount as string
    totalSpent: string; // Amount as string
    reputation: number;
    marketsParticipated: number;
    marketsWon: number;
    totalProfit: string; // Amount as string
    winStreak: number;
    bestWinStreak: number;
    guildId: number | null;
    lastLogin: string | null; // Timestamp as string
}

/**
 * Guild data from GraphQL query
 */
export interface Guild {
    id: number;
    name: string;
    founder: string; // Player ID
    members: Array<{
        id: string;
        displayName: string | null;
        tokenBalance: string;
    }>;
    creationTime: string; // Timestamp
    totalGuildProfit: string; // Amount as string
    guildLevel: number;
    sharedPool: string; // Amount as string
}

/**
 * Market data (for future use)
 */
export interface Market {
    id: number;
    title: string;
    creator: string; // Player ID
    amount: string; // Amount as string
    feePercent: number;
    creationTime: string; // Timestamp
    status: "Active" | "Closed" | "Resolved" | "Cancelled";
    totalLiquidity: string; // Amount as string
    totalParticipants: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
    playerId: string;
    displayName: string | null;
    totalProfit: string; // Amount as string (actually total_earned from contract)
    level: number;
    rank?: number;
}

/**
 * Global leaderboard data
 */
export interface GlobalLeaderboard {
    topTraders: LeaderboardEntry[];
    lastUpdated: string; // Timestamp
}

/**
 * GraphQL query response types
 */
export interface PlayerQueryResponse {
    player: Player | null;
}

export interface PlayerTotalPointsResponse {
    playerTotalPoints: string;
}

export interface DailyOutcomeResponse {
    getDailyOutcome: boolean; // true if prediction was correct, false otherwise
}

export interface WeeklyOutcomeResponse {
    getWeeklyOutcome: boolean;
}

export interface MonthlyOutcomeResponse {
    getMonthlyOutcome: boolean;
}

export interface GlobalLeaderboardResponse {
    globalLeaderboard: GlobalLeaderboard;
}

export interface AllGuildsResponse {
    allGuilds: Guild[];
}

export interface GuildMembersResponse {
    guildMembers: Array<{
        id: string;
        displayName: string | null;
        tokenBalance: string;
    }>;
}

export interface GuildTotalPointsResponse {
    guildTotalPoints: string;
}

/**
 * GraphQL mutation input types
 */
export interface RegisterPlayerInput {
    displayName?: string | null;
}

export interface UpdateProfileInput {
    displayName?: string | null;
}

export interface PredictDailyOutcomeInput {
    outcome: PriceOutcome;
}

export interface PredictWeeklyOutcomeInput {
    outcome: PriceOutcome;
}

export interface PredictMonthlyOutcomeInput {
    outcome: PriceOutcome;
}

