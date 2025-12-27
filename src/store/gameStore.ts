import { create } from "zustand";
import { LineraService } from "@/lib/linera/services/LineraService";
import { amountToPoints } from "@/lib/linera/utils/amount";
import type { PriceOutcome as LineraPriceOutcome } from "@/lib/linera/types";

// ===== Player & Progression =====
export interface Player {
    id: string;
    displayName: string;
    tokenBalance: number; // Points balance
    totalEarned: number; // Lifetime points earned
    totalSpent: number; // Lifetime points spent
    level: number; // Player level (1+)
    experiencePoints: number; // XP for leveling
    reputation: number; // Reputation score (starts at 100)
    marketsParticipated: number;
    marketsWon: number;
    totalProfit: number; // Net profit
    winStreak: number; // Current win streak
    bestWinStreak: number; // Best win streak achieved
    guildId: string | null; // Current guild membership
    achievementsEarned: string[]; // Achievement IDs
    activeMarkets: string[]; // Market IDs player is involved in
    lastLogin?: number; // Last login timestamp (for daily reward cooldown)
}

export interface Asset {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    logo: string;
    marketCap: number;
}

export interface Holding {
    symbol: string;
    name: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    logo: string;
}

// ===== Achievement System =====
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    pointsReward: number;
    xpReward: number;
    earnedAt?: Date;
}

// ===== Point Trading Market =====
export type MarketStatus = "Active" | "Closed" | "Resolved" | "Cancelled";

export interface Market {
    id: string;
    creator: string; // Player ID
    title: string;
    amount: number; // Amount of points to sell/buy
    feePercent: number; // Fee percentage (0-100)
    creationTime: number; // Timestamp
    status: MarketStatus;
    totalLiquidity: number; // Total points available
    positions: Record<string, number>; // PlayerId -> amount of points
    totalParticipants: number;
}

// ===== Price Prediction System =====
export type PredictionPeriod = "Daily" | "Weekly" | "Monthly";
export type PriceOutcome = "Rise" | "Fall" | "Neutral";
export type Cryptocurrency = "BTC" | "ETH" | "SOL" | "BNB" | "ADA" | "DOT";

export interface CryptocurrencyPrice {
    symbol: Cryptocurrency;
    name: string;
    price: number;
    change24h: number;
    logo: string;
    timestamp: number;
}

export interface PlayerPrediction {
    playerId: string;
    cryptocurrency: Cryptocurrency;
    period: PredictionPeriod;
    outcome: PriceOutcome;
    predictionTime: number; // Timestamp
    periodStart: number; // Period start timestamp
    resolved: boolean;
    correct: boolean | null; // null if unresolved
    stakedAmount: number; // Points staked for this prediction
    potentialReward: number; // Reward if correct
}

// ===== Guild System =====
export interface Guild {
    id: string;
    name: string;
    founder: string; // Player ID
    members: string[]; // Player IDs
    creationTime: number; // Timestamp
    totalGuildProfit: number; // Combined member earnings
    guildLevel: number;
    sharedPool: number; // Collective fund
}

// ===== Leaderboard =====
export interface LeaderboardEntry {
    playerId: string;
    displayName: string;
    totalProfit: number; // Note: Contract stores total_earned in this field (ranks by total_earned, not total_profit)
    winRate: number; // Percentage (0-100)
    level: number;
    rank: number;
    isCurrentUser?: boolean;
}

export interface GuildLeaderboardEntry {
    guildId: string;
    name: string;
    totalGuildProfit: number;
    memberCount: number;
    rank: number;
}

// ===== Current Market Price =====
export interface MarketPrice {
    price: number; // Current crypto price
    timestamp: number;
}

// ===== Game State =====
interface GameState {
    // Player state
    player: Player;

    // Portfolio
    portfolio: Holding[];
    portfolioValue: number;
    totalProfit: number;
    totalProfitPercent: number;

    // Markets
    markets: Market[];
    currentMarketPrice: MarketPrice;
    cryptocurrencyPrices: Record<Cryptocurrency, CryptocurrencyPrice>;

    // Predictions
    predictions: PlayerPrediction[];

    // Guilds
    currentGuild: Guild | null;
    availableGuilds: Guild[];

    // Leaderboards
    globalLeaderboard: LeaderboardEntry[];
    guildLeaderboard: GuildLeaderboardEntry[];

    // Achievements
    achievements: Achievement[];

    // Meta progression (optional to keep backward compatibility)
    xp?: number;
    level?: number;
    badges?: string[];
    energy?: number;
    lastXPEventAt?: number;

    // UI state
    isLoading: boolean;
    error: string | null;
}

// ===== Game Actions =====
interface GameActions {
    // Player actions (now async - call LineraService)
    registerPlayer: (displayName: string, playerId?: string) => Promise<boolean>;
    updateProfile: (displayName: string, playerId?: string) => Promise<boolean>;
    claimDailyReward: (playerId?: string) => Promise<boolean>;
    addXP: (points: number) => void;
    addAchievement: (achievementId: string) => void;

    // Market actions
    createMarket: (title: string, amount: number, feePercent: number) => void;
    buyShares: (marketId: string, amount: number) => void;
    sellShares: (marketId: string, amount: number) => void;

    // Prediction actions (now async - call LineraService, cryptocurrency and stakeAmount ignored for now)
    predictDailyOutcome: (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount?: number) => Promise<boolean>;
    predictWeeklyOutcome: (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount?: number) => Promise<boolean>;
    predictMonthlyOutcome: (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount?: number) => Promise<boolean>;
    setCryptocurrencyPrice: (symbol: Cryptocurrency, price: number, change24h?: number) => void;

    // Guild actions
    createGuild: (name: string) => void;
    joinGuild: (guildId: string) => void;
    leaveGuild: () => void;
    contributeToGuild: (amount: number) => void;

    // Data actions
    setMarkets: (markets: Market[]) => void;
    setCurrentMarketPrice: (price: number) => void;
    setLeaderboard: (
        global: LeaderboardEntry[],
        guild: GuildLeaderboardEntry[]
    ) => void;
    setGuilds: (guilds: Guild[]) => void;

    // Meta progression actions
    updateXP: (amount: number) => void;
    levelUp: () => void;
    addBadge: (badgeId: string) => void;
    updatePortfolio: (value: number, percent: number) => void;

    // UI actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

// ===== Initial Player State =====
const initialPlayer: Player = {
    id: "player-1",
    displayName: "CryptoTrader",
    tokenBalance: 100000, // Initial points (default: 100,000 from config)
    totalEarned: 100000,
    totalSpent: 0,
    level: 1,
    experiencePoints: 0,
    reputation: 100,
    marketsParticipated: 0,
    marketsWon: 0,
    totalProfit: 0,
    winStreak: 0,
    bestWinStreak: 0,
    guildId: null,
    achievementsEarned: [],
    activeMarkets: [],
    lastLogin: 0, // Will be set when daily reward is claimed
};

// ===== Mock Achievements =====
const mockAchievements: Achievement[] = [
    {
        id: "CreateMarket",
        name: "Market Creator",
        description: "Create your first market",
        icon: "🏪",
        pointsReward: 100,
        xpReward: 200,
    },
    {
        id: "FirstBuy",
        name: "First Purchase",
        description: "Make your first purchase",
        icon: "🛒",
        pointsReward: 50,
        xpReward: 100,
    },
    {
        id: "FirstSell",
        name: "First Sale",
        description: "Make your first sale",
        icon: "💰",
        pointsReward: 50,
        xpReward: 100,
    },
    {
        id: "JoinGuild",
        name: "Guild Member",
        description: "Join a guild",
        icon: "👥",
        pointsReward: 150,
        xpReward: 300,
    },
    {
        id: "ReachLevel2",
        name: "Level Up II",
        description: "Reach level 2",
        icon: "⭐",
        pointsReward: 200,
        xpReward: 400,
    },
    {
        id: "ReachLevel3",
        name: "Level Up III",
        description: "Reach level 3",
        icon: "⭐",
        pointsReward: 400,
        xpReward: 800,
    },
    {
        id: "ReachLevel5",
        name: "Level Up V",
        description: "Reach level 5",
        icon: "⭐",
        pointsReward: 1000,
        xpReward: 2000,
    },
];

// ===== Mock Markets =====
const mockMarkets: Market[] = [
    {
        id: "market-1",
        creator: "player-2",
        title: "Premium Points Market",
        amount: 50000,
        feePercent: 10,
        creationTime: Date.now() - 86400000,
        status: "Active",
        totalLiquidity: 45000,
        positions: {},
        totalParticipants: 5,
    },
    {
        id: "market-2",
        creator: "player-3",
        title: "Low Fee Trading",
        amount: 30000,
        feePercent: 5,
        creationTime: Date.now() - 3600000,
        status: "Active",
        totalLiquidity: 28000,
        positions: {},
        totalParticipants: 3,
    },
    {
        id: "market-3",
        creator: "player-4",
        title: "High Volume Market",
        amount: 100000,
        feePercent: 15,
        creationTime: Date.now() - 7200000,
        status: "Active",
        totalLiquidity: 85000,
        positions: {},
        totalParticipants: 12,
    },
];

// ===== Mock Leaderboard =====
const mockLeaderboard: LeaderboardEntry[] = [
    {
        playerId: "player-5",
        displayName: "CryptoKing",
        totalProfit: 50000,
        winRate: 75.5,
        level: 8,
        rank: 1,
    },
    {
        playerId: "player-6",
        displayName: "DiamondHands",
        totalProfit: 35000,
        winRate: 68.2,
        level: 6,
        rank: 2,
    },
    {
        playerId: "player-1",
        displayName: "CryptoTrader",
        totalProfit: 0,
        winRate: 0,
        level: 1,
        rank: 3,
        isCurrentUser: true,
    },
];

// ===== Mock Guilds =====
const mockGuilds: Guild[] = [
    {
        id: "guild-1",
        name: "Diamond Hands",
        founder: "player-5",
        members: ["player-5", "player-6"],
        creationTime: Date.now() - 604800000,
        totalGuildProfit: 85000,
        guildLevel: 3,
        sharedPool: 15000,
    },
    {
        id: "guild-2",
        name: "Prediction Masters",
        founder: "player-7",
        members: ["player-7", "player-8", "player-9"],
        creationTime: Date.now() - 2592000000,
        totalGuildProfit: 120000,
        guildLevel: 5,
        sharedPool: 25000,
    },
];

// ===== Helper Functions =====
// Calculate level from XP (XP threshold: 1000 × (4^(level-1)))
function calculateLevel(xp: number): number {
    let level = 1;
    let requiredXP = 1000;
    let totalXP = 0;

    while (totalXP + requiredXP <= xp) {
        totalXP += requiredXP;
        level++;
        requiredXP = 1000 * Math.pow(4, level - 1);
    }

    return level;
}

// Calculate XP required for next level
function getXPForNextLevel(xp: number): number {
    const currentLevel = calculateLevel(xp);
    let totalXP = 0;
    let requiredXP = 1000;

    for (let i = 1; i < currentLevel; i++) {
        totalXP += requiredXP;
        requiredXP = 1000 * Math.pow(4, i);
    }

    const nextLevelXP = 1000 * Math.pow(4, currentLevel - 1);
    return totalXP + nextLevelXP - xp;
}

// ===== Store Implementation =====
export const useGameStore = create<GameState & GameActions>((set, get) => ({
    // Initial state
    player: initialPlayer,
    portfolio: [],
    portfolioValue: 100000,
    totalProfit: 0,
    totalProfitPercent: 0,
    markets: mockMarkets,
    currentMarketPrice: {
        price: 89156.91, // BTC price in points (real current price)
        timestamp: Date.now(),
    },
    cryptocurrencyPrices: {
        BTC: {
            symbol: "BTC",
            name: "Bitcoin",
            price: 89156.91,
            change24h: 0.1,
            logo: "₿",
            timestamp: Date.now(),
        },
        ETH: {
            symbol: "ETH",
            name: "Ethereum",
            price: 3119.99,
            change24h: 1.1,
            logo: "Ξ",
            timestamp: Date.now(),
        },
        SOL: {
            symbol: "SOL",
            name: "Solana",
            price: 132.83,
            change24h: 1.3,
            logo: "◎",
            timestamp: Date.now(),
        },
        BNB: {
            symbol: "BNB",
            name: "Binance Coin",
            price: 885.03,
            change24h: 0.6,
            logo: "BNB",
            timestamp: Date.now(),
        },
        ADA: {
            symbol: "ADA",
            name: "Cardano",
            price: 0.4024,
            change24h: 0.3,
            logo: "₳",
            timestamp: Date.now(),
        },
        DOT: {
            symbol: "DOT",
            name: "Polkadot",
            price: 1.99, // Current market price
            change24h: 2.3,
            logo: "●",
            timestamp: Date.now(),
        },
    },
    predictions: [],
    currentGuild: null,
    availableGuilds: mockGuilds,
    globalLeaderboard: mockLeaderboard,
    guildLeaderboard: [],
    achievements: mockAchievements,
    xp: initialPlayer.experiencePoints,
    level: initialPlayer.level,
    badges: [],
    energy: 100,
    lastXPEventAt: undefined,
    isLoading: false,
    error: null,

    // Player actions (async - call LineraService)
    registerPlayer: async (displayName: string, playerId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            const success = await service.registerPlayer(displayName);
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch player data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to register player" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to register player";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    updateProfile: async (displayName: string, playerId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            const success = await service.updateProfile(displayName);
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch player data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to update profile" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    claimDailyReward: async (playerId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            const success = await service.claimDailyReward();
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch player data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to claim daily reward" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to claim daily reward";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    addXP: (points: number) => {
        set((state) => {
            const newXP = state.player.experiencePoints + points;
            const newLevel = calculateLevel(newXP);

            return {
                player: {
                    ...state.player,
                    experiencePoints: newXP,
                    level: newLevel,
                },
            };
        });
    },

    addAchievement: (achievementId: string) => {
        const state = get();
        const achievement = state.achievements.find((a) => a.id === achievementId);
        if (!achievement || state.player.achievementsEarned.includes(achievementId)) {
            return;
        }

        set((state) => ({
            player: {
                ...state.player,
                achievementsEarned: [...state.player.achievementsEarned, achievementId],
                tokenBalance: state.player.tokenBalance + achievement.pointsReward,
                totalEarned: state.player.totalEarned + achievement.pointsReward,
            },
        }));

        // Add XP from achievement
        get().addXP(achievement.xpReward);
    },

    // Market actions
    createMarket: (title: string, amount: number, feePercent: number) => {
        const state = get();
        const creationCost = 100; // Hardcoded creation cost

        // Check requirements: Level 5+ and 10,000+ points
        if (state.player.level < 5 || state.player.tokenBalance < 10000) {
            set({ error: "Requires Level 5+ and 10,000+ points" });
            return;
        }

        if (state.player.tokenBalance < amount + creationCost) {
            set({ error: "Insufficient balance" });
            return;
        }

        const newMarket: Market = {
            id: `market-${Date.now()}`,
            creator: state.player.id,
            title,
            amount,
            feePercent,
            creationTime: Date.now(),
            status: "Active",
            totalLiquidity: amount,
            positions: {},
            totalParticipants: 0,
        };

        set((state) => ({
            markets: [...state.markets, newMarket],
            player: {
                ...state.player,
                tokenBalance: state.player.tokenBalance - amount - creationCost,
                totalSpent: state.player.totalSpent + amount + creationCost,
                activeMarkets: [...state.player.activeMarkets, newMarket.id],
            },
        }));
    },

    buyShares: (marketId: string, desiredPoints: number) => {
        const state = get();
        const market = state.markets.find((m) => m.id === marketId);
        if (!market || market.status !== "Active") return;

        // Progressive exchange rate: pay 10% of desired amount
        const basePayment = desiredPoints / 10;
        const fee = (basePayment * market.feePercent) / 100;
        const totalPayment = basePayment + fee;

        if (state.player.tokenBalance < totalPayment) {
            set({ error: "Insufficient balance" });
            return;
        }

        // Points to receive is limited by market liquidity
        const pointsToReceive = Math.min(desiredPoints, market.totalLiquidity);
        if (pointsToReceive === 0) {
            set({ error: "Insufficient market liquidity" });
            return;
        }

        // Update market
        const updatedMarket: Market = {
            ...market,
            totalLiquidity: market.totalLiquidity - pointsToReceive,
            positions: {
                ...market.positions,
                [state.player.id]:
                    (market.positions[state.player.id] || 0) + pointsToReceive,
            },
            totalParticipants: market.totalParticipants + 1,
        };

        // Player pays and receives points (matches contract logic)
        // Contract: Player pays basePayment + fee, receives pointsToReceive
        set((state) => ({
            markets: state.markets.map((m) =>
                m.id === marketId ? updatedMarket : m
            ),
            player: {
                ...state.player,
                tokenBalance: state.player.tokenBalance - totalPayment + pointsToReceive, // Pay and receive
                totalSpent: state.player.totalSpent + totalPayment,
                totalEarned: state.player.totalEarned + pointsToReceive, // Points received count as earned
                marketsParticipated: state.player.marketsParticipated + 1,
            },
        }));
    },

    sellShares: (marketId: string, amount: number) => {
        const state = get();
        const market = state.markets.find((m) => m.id === marketId);
        if (!market || market.status !== "Active") return;

        // Check if player is Level 5+
        if (state.player.level < 5) {
            set({ error: "Requires Level 5+ to sell" });
            return;
        }

        if (state.player.tokenBalance < amount) {
            set({ error: "Insufficient balance" });
            return;
        }

        const playerPosition = market.positions[state.player.id] || 0;
        if (playerPosition < amount) {
            set({ error: "Insufficient shares" });
            return;
        }

        // Calculate fee (seller pays fee based on market's fee percentage)
        const fee = (amount * market.feePercent) / 100;
        const pointsForMarket = amount - fee; // Amount after fee goes to market

        // Update market - liquidity increases by pointsForMarket (amount minus fee)
        const updatedMarket: Market = {
            ...market,
            totalLiquidity: market.totalLiquidity + pointsForMarket,
            positions: {
                ...market.positions,
                [state.player.id]: playerPosition - amount,
            },
        };

        // Contract logic: Player burns amount points (deducts from balance)
        // No payment received - points are burned/sold to market
        // Fee is distributed to creator (98%) and platform (2%) - handled separately in contract
        set((state) => ({
            markets: state.markets.map((m) =>
                m.id === marketId ? updatedMarket : m
            ),
            player: {
                ...state.player,
                tokenBalance: state.player.tokenBalance - amount, // Burn points
                totalSpent: state.player.totalSpent + amount,
            },
        }));
    },

    // Prediction actions (async - call LineraService)
    // Note: cryptocurrency and stakeAmount parameters are kept for API compatibility but ignored
    // The contract only supports BTC predictions and doesn't use staking
    predictDailyOutcome: async (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount: number = 0) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            // Convert PriceOutcome to Linera PriceOutcome (they should match)
            const lineraOutcome = outcome as LineraPriceOutcome;
            const success = await service.predictDailyOutcome(lineraOutcome);
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch prediction data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to submit daily prediction" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit daily prediction";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    predictWeeklyOutcome: async (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount: number = 0) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            const lineraOutcome = outcome as LineraPriceOutcome;
            const success = await service.predictWeeklyOutcome(lineraOutcome);
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch prediction data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to submit weekly prediction" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit weekly prediction";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    predictMonthlyOutcome: async (cryptocurrency: Cryptocurrency, outcome: PriceOutcome, stakeAmount: number = 0) => {
        set({ isLoading: true, error: null });
        try {
            const service = LineraService.getInstance();
            const lineraOutcome = outcome as LineraPriceOutcome;
            const success = await service.predictMonthlyOutcome(lineraOutcome);
            if (success) {
                set({ isLoading: false });
                // Note: Components should invalidate queries to refetch prediction data
                return true;
            } else {
                set({ isLoading: false, error: "Failed to submit monthly prediction" });
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit monthly prediction";
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    },

    setCryptocurrencyPrice: (symbol: Cryptocurrency, price: number, change24h: number = 0) => {
        set((state) => ({
            cryptocurrencyPrices: {
                ...state.cryptocurrencyPrices,
                [symbol]: {
                    ...state.cryptocurrencyPrices[symbol],
                    price,
                    change24h,
                    timestamp: Date.now(),
                },
            },
        }));
    },

    // Guild actions
    createGuild: (name: string) => {
        const state = get();
        const newGuild: Guild = {
            id: `guild-${Date.now()}`,
            name,
            founder: state.player.id,
            members: [state.player.id],
            creationTime: Date.now(),
            totalGuildProfit: 0,
            guildLevel: 1,
            sharedPool: 0,
        };

        set((state) => ({
            availableGuilds: [...state.availableGuilds, newGuild],
            currentGuild: newGuild,
            player: {
                ...state.player,
                guildId: newGuild.id,
            },
        }));
    },

    joinGuild: (guildId: string) => {
        const state = get();
        const guild = state.availableGuilds.find((g) => g.id === guildId);
        if (!guild) return;

        const updatedGuild: Guild = {
            ...guild,
            members: [...guild.members, state.player.id],
        };

        set((state) => ({
            currentGuild: updatedGuild,
            availableGuilds: state.availableGuilds.map((g) =>
                g.id === guildId ? updatedGuild : g
            ),
            player: {
                ...state.player,
                guildId: guildId,
            },
        }));
    },

    leaveGuild: () => {
        const state = get();
        if (!state.currentGuild) return;

        const updatedGuild: Guild = {
            ...state.currentGuild,
            members: state.currentGuild.members.filter(
                (id) => id !== state.player.id
            ),
        };

        set((currentState) => ({
            currentGuild: null,
            availableGuilds: currentState.availableGuilds.map((g) =>
                g.id === state.currentGuild?.id ? updatedGuild : g
            ),
            player: {
                ...currentState.player,
                guildId: null,
            },
        }));
    },

    contributeToGuild: (amount: number) => {
        const state = get();
        if (!state.currentGuild || state.player.tokenBalance < amount) return;

        const updatedGuild: Guild = {
            ...state.currentGuild,
            sharedPool: state.currentGuild.sharedPool + amount,
        };

        set((state) => ({
            currentGuild: updatedGuild,
            availableGuilds: state.availableGuilds.map((g) =>
                g.id === state.currentGuild?.id ? updatedGuild : g
            ),
            player: {
                ...state.player,
                tokenBalance: state.player.tokenBalance - amount,
                totalSpent: state.player.totalSpent + amount,
            },
        }));
    },

    // Data actions
    setMarkets: (markets: Market[]) => set({ markets }),
    setCurrentMarketPrice: (price: number) =>
        set({
            currentMarketPrice: {
                price,
                timestamp: Date.now(),
            },
        }),
    setLeaderboard: (
        global: LeaderboardEntry[],
        guild: GuildLeaderboardEntry[]
    ) => set({ globalLeaderboard: global, guildLeaderboard: guild }),
    setGuilds: (guilds: Guild[]) => set({ availableGuilds: guilds }),

    // Meta progression actions (backward compatible stubs)
    updateXP: (amount: number) => {
        const now = Date.now();
        set((state) => {
            const baselineXP =
                state.xp ?? state.player.experiencePoints ?? 0;
            const nextXP = Math.max(0, baselineXP + amount);
            const playerXP = Math.max(
                0,
                state.player.experiencePoints + amount
            );
            const computedLevel = calculateLevel(playerXP);
            return {
                xp: nextXP,
                lastXPEventAt: now,
                player: {
                    ...state.player,
                    experiencePoints: playerXP,
                    level: Math.max(state.player.level, computedLevel),
                },
            };
        });
    },
    levelUp: () => {
        const now = Date.now();
        set((state) => {
            const nextLevel =
                (state.level ?? state.player.level ?? 1) + 1;
            return {
                level: nextLevel,
                lastXPEventAt: now,
                player: {
                    ...state.player,
                    level: state.player.level + 1,
                },
            };
        });
    },
    addBadge: (badgeId: string) => {
        const now = Date.now();
        set((state) => {
            const existingBadges = state.badges ?? [];
            const alreadyHasBadge = existingBadges.includes(badgeId);
            const updatedBadges = alreadyHasBadge
                ? existingBadges
                : [...existingBadges, badgeId];

            const playerHasBadge =
                state.player.achievementsEarned.includes(badgeId);

            return {
                badges: updatedBadges,
                lastXPEventAt: now,
                player: {
                    ...state.player,
                    achievementsEarned: playerHasBadge
                        ? state.player.achievementsEarned
                        : [
                              ...state.player.achievementsEarned,
                              badgeId,
                          ],
                },
            };
        });
    },
    updatePortfolio: (value: number, percent: number) => {
        set((state) => ({
            portfolioValue: value,
            totalProfit: value - 100000, // baseline assumes starting balance
            totalProfitPercent:
                typeof percent === "number"
                    ? percent
                    : state.totalProfitPercent,
        }));
    },

    // UI actions
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
}));

// Export helper functions
export { calculateLevel, getXPForNextLevel };
