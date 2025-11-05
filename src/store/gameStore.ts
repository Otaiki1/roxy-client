import { create } from "zustand";

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

export interface PlayerPrediction {
    playerId: string;
    period: PredictionPeriod;
    outcome: PriceOutcome;
    predictionTime: number; // Timestamp
    periodStart: number; // Period start timestamp
    resolved: boolean;
    correct: boolean | null; // null if unresolved
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

    // Markets
    markets: Market[];
    currentMarketPrice: MarketPrice;

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

    // UI state
    isLoading: boolean;
    error: string | null;
}

// ===== Game Actions =====
interface GameActions {
    // Player actions
    registerPlayer: (displayName: string) => void;
    updateProfile: (displayName: string) => void;
    claimDailyReward: () => void;
    addXP: (points: number) => void;
    addAchievement: (achievementId: string) => void;

    // Market actions
    createMarket: (title: string, amount: number, feePercent: number) => void;
    buyShares: (marketId: string, amount: number) => void;
    sellShares: (marketId: string, amount: number) => void;

    // Prediction actions
    predictDailyOutcome: (outcome: PriceOutcome) => void;
    predictWeeklyOutcome: (outcome: PriceOutcome) => void;
    predictMonthlyOutcome: (outcome: PriceOutcome) => void;

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
    markets: mockMarkets,
    currentMarketPrice: {
        price: 45000, // BTC price in points
        timestamp: Date.now(),
    },
    predictions: [],
    currentGuild: null,
    availableGuilds: mockGuilds,
    globalLeaderboard: mockLeaderboard,
    guildLeaderboard: [],
    achievements: mockAchievements,
    isLoading: false,
    error: null,

    // Player actions
    registerPlayer: (displayName: string) => {
        set({
                player: {
                ...initialPlayer,
                displayName,
                id: `player-${Date.now()}`,
            },
        });
    },

    updateProfile: (displayName: string) => {
            set((state) => ({
                player: {
                    ...state.player,
                displayName,
                },
            }));
    },

    claimDailyReward: () => {
        const state = get();
        const reward = 10; // Default daily reward
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Check 24-hour cooldown (simplified - should use last_login from contract)
        // For now, we'll use a simple check - in production, this would come from contract
        const lastLogin = (state.player as any).lastLogin || 0;
        const timeSinceLastLogin = now - lastLogin;

        if (timeSinceLastLogin < oneDayMs && lastLogin > 0) {
            set({ error: "Daily reward already claimed. Wait 24 hours." });
            return;
        }

        set((state) => ({
            player: {
                ...state.player,
                tokenBalance: state.player.tokenBalance + reward,
                totalEarned: state.player.totalEarned + reward,
                lastLogin: now, // Track last login time
            },
        }));
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

    // Prediction actions
    predictDailyOutcome: (outcome: PriceOutcome) => {
        const state = get();
        const now = Date.now();
        const periodStart = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);

        const prediction: PlayerPrediction = {
            playerId: state.player.id,
            period: "Daily",
            outcome,
            predictionTime: now,
            periodStart,
            resolved: false,
            correct: null,
        };

        set((state) => ({
            predictions: [...state.predictions, prediction],
        }));
    },

    predictWeeklyOutcome: (outcome: PriceOutcome) => {
        const state = get();
        const now = Date.now();
        const periodStart =
            Math.floor(now / (7 * 24 * 60 * 60 * 1000)) * (7 * 24 * 60 * 60 * 1000);

        const prediction: PlayerPrediction = {
            playerId: state.player.id,
            period: "Weekly",
            outcome,
            predictionTime: now,
            periodStart,
            resolved: false,
            correct: null,
        };

        set((state) => ({
            predictions: [...state.predictions, prediction],
        }));
    },

    predictMonthlyOutcome: (outcome: PriceOutcome) => {
        const state = get();
        const now = Date.now();
        const periodStart =
            Math.floor(now / (30 * 24 * 60 * 60 * 1000)) * (30 * 24 * 60 * 60 * 1000);

        const prediction: PlayerPrediction = {
            playerId: state.player.id,
            period: "Monthly",
            outcome,
            predictionTime: now,
            periodStart,
            resolved: false,
            correct: null,
        };

        set((state) => ({
            predictions: [...state.predictions, prediction],
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

    // UI actions
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
}));

// Export helper functions
export { calculateLevel, getXPForNextLevel };
