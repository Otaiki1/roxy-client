import { useGameStore } from "@/store/gameStore";
import type {
    Market,
    PriceOutcome,
    LeaderboardEntry,
    Guild,
} from "@/store/gameStore";

// Import useGameStore properly to access state
const getGameStore = () => useGameStore.getState();

// Mock mode configuration
export interface MockModeConfig {
    enabled: boolean;
    priceUpdateInterval: number; // ms
    playerActivityInterval: number; // ms
    leaderboardUpdateInterval: number; // ms
    priceVolatility: number; // 0-1, how much price can change
}

const defaultConfig: MockModeConfig = {
    enabled: false,
    priceUpdateInterval: 5000, // Update price every 5 seconds
    playerActivityInterval: 10000, // Simulate player activity every 10 seconds
    leaderboardUpdateInterval: 30000, // Update leaderboard every 30 seconds
    priceVolatility: 0.02, // 2% max change per update
};

// Mock player names for simulated activity
const mockPlayerNames = [
    "CryptoKing",
    "DiamondHands",
    "MoonTrader",
    "BullRunner",
    "WhaleWatcher",
    "HODLMaster",
    "TrendSetter",
    "ProfitSeeker",
    "MarketMaker",
    "PriceHunter",
];

// Price history for realistic trends
let priceHistory: number[] = [];
let priceTrend: "up" | "down" | "neutral" = "neutral";
let trendStrength = 0;

class MockModeService {
    private config: MockModeConfig = defaultConfig;
    private intervals: NodeJS.Timeout[] = [];
    private isRunning = false;
    private priceHistorySize = 100;

    // Store reference to get state
    private getState = getGameStore;

    start(config?: Partial<MockModeConfig>) {
        if (this.isRunning) return;

        this.config = { ...defaultConfig, ...config, enabled: true };
        this.isRunning = true;

        // Initialize price history
        const state = this.getState();
        const currentPrice = state.currentMarketPrice.price;
        priceHistory = [currentPrice];
        priceTrend = "neutral";
        trendStrength = 0;

        // Start price updates
        this.intervals.push(
            setInterval(() => this.updatePrice(), this.config.priceUpdateInterval)
        );

        // Start player activity simulation
        this.intervals.push(
            setInterval(
                () => this.simulatePlayerActivity(),
                this.config.playerActivityInterval
            )
        );

        // Start leaderboard updates
        this.intervals.push(
            setInterval(
                () => this.updateLeaderboard(),
                this.config.leaderboardUpdateInterval
            )
        );

        // Start prediction resolution
        this.intervals.push(
            setInterval(() => this.resolvePredictions(), 10000) // Check every 10s
        );

        // Initial price update
        this.updatePrice();
    }

    stop() {
        this.isRunning = false;
        this.intervals.forEach((interval) => clearInterval(interval));
        this.intervals = [];
    }

    private updatePrice() {
        const state = this.getState();
        const cryptocurrencies: Array<"BTC" | "ETH" | "SOL" | "BNB" | "ADA" | "DOT"> = [
            "BTC",
            "ETH",
            "SOL",
            "BNB",
            "ADA",
            "DOT",
        ];

        // Update trend based on BTC price history
        const btcCurrentPrice = state.cryptocurrencyPrices.BTC?.price || state.currentMarketPrice.price;
        if (priceHistory.length >= 5) {
            const recent = priceHistory.slice(-5);
            const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
            const older = priceHistory.slice(-10, -5);
            const avgOlder = older.length > 0
                ? older.reduce((a, b) => a + b, 0) / older.length
                : btcCurrentPrice;

            if (avgRecent > avgOlder * 1.01) {
                priceTrend = "up";
                trendStrength = Math.min(1, trendStrength + 0.1);
            } else if (avgRecent < avgOlder * 0.99) {
                priceTrend = "down";
                trendStrength = Math.min(1, trendStrength + 0.1);
            } else {
                trendStrength = Math.max(0, trendStrength - 0.05);
                if (trendStrength < 0.2) priceTrend = "neutral";
            }
        }

        // Update all cryptocurrency prices
        cryptocurrencies.forEach((crypto) => {
            const cryptoData = state.cryptocurrencyPrices[crypto];
            if (!cryptoData) return;

            const currentPrice = cryptoData.price;
            const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
            const trendBias = trendStrength * 0.3;
            const volatility = this.config.priceVolatility;

            // Calculate new price
            const trendMultiplier = priceTrend === "up" ? 1 : priceTrend === "down" ? -1 : 0;
            const changePercent = (randomChange + trendBias * trendMultiplier) * volatility;
            
            // Different price floors for different cryptos (based on real market prices)
            const priceFloors: Record<string, number> = {
                BTC: 50000, // Realistic floor based on current ~$89k
                ETH: 2000, // Realistic floor based on current ~$3.1k
                SOL: 50, // Realistic floor based on current ~$133
                BNB: 400, // Realistic floor based on current ~$885
                ADA: 0.2, // Realistic floor based on current ~$0.40
                DOT: 1.0, // Realistic floor based on current ~$1.99
            };

            const newPrice = Math.max(
                priceFloors[crypto] || 1,
                currentPrice * (1 + changePercent)
            );

            // Calculate 24h change (simplified)
            const change24h = changePercent * 100;

            // Update cryptocurrency price
            state.setCryptocurrencyPrice(crypto, newPrice, change24h);
        });

        // Update price history (for BTC trend tracking)
        const btcPrice = state.cryptocurrencyPrices.BTC?.price || state.currentMarketPrice.price;
        priceHistory.push(btcPrice);
        if (priceHistory.length > this.priceHistorySize) {
            priceHistory.shift();
        }

        // Update main market price (BTC)
        state.setCurrentMarketPrice(btcPrice);

        // Trigger prediction resolution check
        this.checkPredictionResolution();
    }

    private checkPredictionResolution() {
        const state = this.getState();
        const predictions = state.predictions.filter((p) => !p.resolved);

        if (predictions.length === 0) return;

        // Check daily predictions (resolve after 24 hours)
        const now = Date.now();

        // For mock mode, we'll resolve predictions faster for demo purposes
        // Daily: 2 minutes, Weekly: 5 minutes, Monthly: 10 minutes
        const mockPeriodMs = {
            Daily: 2 * 60 * 1000, // 2 minutes
            Weekly: 5 * 60 * 1000, // 5 minutes
            Monthly: 10 * 60 * 1000, // 10 minutes
        };

        predictions.forEach((prediction) => {
            const periodMs = mockPeriodMs[prediction.period];
            const periodEnd = prediction.periodStart + periodMs;
            const isExpired = now >= periodEnd;

            if (isExpired && !prediction.resolved) {
                // Get current price for the predicted cryptocurrency
                const cryptoData = state.cryptocurrencyPrices[prediction.cryptocurrency];
                if (!cryptoData) return;

                const currentPrice = cryptoData.price;
                // Use a reference price (simplified - in real app would track period start price)
                const referencePrice = currentPrice * (0.95 + Math.random() * 0.1); // Simulate period start
                const priceChange = currentPrice - referencePrice;
                const priceChangePercent = (priceChange / referencePrice) * 100;

                // Determine actual outcome based on price change
                let actualOutcome: PriceOutcome;
                if (priceChangePercent > 0.5) {
                    actualOutcome = "Rise";
                } else if (priceChangePercent < -0.5) {
                    actualOutcome = "Fall";
                } else {
                    actualOutcome = "Neutral";
                }

                // Resolve prediction
                const isCorrect = prediction.outcome === actualOutcome;
                // Reward is based on staked amount or default reward
                const reward = isCorrect
                    ? prediction.stakedAmount > 0
                        ? prediction.potentialReward
                        : this.getPredictionReward(prediction.period, true)
                    : 0;

                // Update prediction
                const updatedPredictions = state.predictions.map((pred) =>
                    pred === prediction
                        ? { ...pred, resolved: true, correct: isCorrect }
                        : pred
                );

                // Update player stats
                const updatedPlayer = {
                    ...state.player,
                    tokenBalance: state.player.tokenBalance + reward,
                    totalEarned: state.player.totalEarned + reward,
                    experiencePoints: state.player.experiencePoints + (isCorrect ? 50 : 10),
                    marketsWon: isCorrect
                        ? state.player.marketsWon + 1
                        : state.player.marketsWon,
                };

                // Recalculate level
                const newLevel = this.calculateLevel(updatedPlayer.experiencePoints);

                state.setError(null);
                useGameStore.setState({
                    predictions: updatedPredictions,
                    player: {
                        ...updatedPlayer,
                        level: newLevel,
                    },
                });
            }
        });
    }

    private resolvePredictions() {
        this.checkPredictionResolution();
    }

    private getPredictionReward(period: string, isCorrect: boolean): number {
        const baseReward =
            period === "Daily" ? 100 : period === "Weekly" ? 500 : 1000;
        return isCorrect ? baseReward : 0;
    }

    private calculateLevel(xp: number): number {
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

    private simulatePlayerActivity() {
        const state = this.getState();
        const random = Math.random();

        // 30% chance: New market created
        if (random < 0.3 && state.markets.length < 20) {
            this.simulateMarketCreation();
        }

        // 25% chance: Player makes prediction
        if (random >= 0.3 && random < 0.55) {
            this.simulatePrediction();
        }

        // 20% chance: Market activity (buy/sell)
        if (random >= 0.55 && random < 0.75 && state.markets.length > 0) {
            this.simulateMarketActivity();
        }

        // 15% chance: Guild activity
        if (random >= 0.75 && random < 0.9 && state.availableGuilds.length > 0) {
            this.simulateGuildActivity();
        }

        // 10% chance: New guild created
        if (random >= 0.9) {
            this.simulateGuildCreation();
        }
    }

    private simulateMarketCreation() {
        const state = this.getState();
        const mockPlayerName =
            mockPlayerNames[Math.floor(Math.random() * mockPlayerNames.length)];

        const titles = [
            "Premium Trading Pool",
            "High Yield Market",
            "Elite Points Exchange",
            "Fast Liquidity Market",
            "Stable Returns Pool",
        ];

        const newMarket: Market = {
            id: `market-mock-${Date.now()}`,
            creator: `player-${mockPlayerName}`,
            title: titles[Math.floor(Math.random() * titles.length)],
            amount: Math.floor(Math.random() * 50000) + 10000, // 10k-60k
            feePercent: Math.floor(Math.random() * 15) + 5, // 5-20%
            creationTime: Date.now(),
            status: "Active",
            totalLiquidity: Math.floor(Math.random() * 40000) + 5000,
            positions: {},
            totalParticipants: Math.floor(Math.random() * 5),
        };

        state.setMarkets([...state.markets, newMarket]);
    }

    private simulatePrediction() {
        // Simulate other players making predictions
        // In a real scenario, this would be other players' predictions
        // For now, we just simulate the activity without adding to user's predictions
    }

    private simulateMarketActivity() {
        const state = this.getState();
        const activeMarkets = state.markets.filter((m) => m.status === "Active");

        if (activeMarkets.length === 0) return;

        const market = activeMarkets[Math.floor(Math.random() * activeMarkets.length)];
        const isBuy = Math.random() > 0.5;

        // Simulate buy/sell activity (update market liquidity)
        const updatedMarkets = state.markets.map((m) => {
            if (m.id !== market.id) return m;

            const activityAmount = Math.floor(Math.random() * 5000) + 1000;

            if (isBuy && m.totalLiquidity >= activityAmount) {
                return {
                    ...m,
                    totalLiquidity: m.totalLiquidity - activityAmount,
                    totalParticipants: m.totalParticipants + 1,
                };
            } else if (!isBuy) {
                return {
                    ...m,
                    totalLiquidity: m.totalLiquidity + activityAmount,
                };
            }

            return m;
        });

        state.setMarkets(updatedMarkets);
    }

    private simulateGuildActivity() {
        const state = this.getState();
        const guilds = state.availableGuilds;

        if (guilds.length === 0) return;

        const guild = guilds[Math.floor(Math.random() * guilds.length)];
        const updatedGuilds = state.availableGuilds.map((g) => {
            if (g.id !== guild.id) return g;

            // Simulate contribution or member activity
            const contribution = Math.floor(Math.random() * 1000) + 100;
            return {
                ...g,
                sharedPool: g.sharedPool + contribution,
                totalGuildProfit: g.totalGuildProfit + Math.floor(Math.random() * 500),
            };
        });

        state.setGuilds(updatedGuilds);
    }

    private simulateGuildCreation() {
        const state = this.getState();
        const mockPlayerName =
            mockPlayerNames[Math.floor(Math.random() * mockPlayerNames.length)];

        const guildNames = [
            "Diamond Hands",
            "Prediction Masters",
            "Market Dominators",
            "Profit Seekers",
            "Elite Traders",
        ];

        const newGuild: Guild = {
            id: `guild-mock-${Date.now()}`,
            name: guildNames[Math.floor(Math.random() * guildNames.length)],
            founder: `player-${mockPlayerName}`,
            members: [`player-${mockPlayerName}`],
            creationTime: Date.now(),
            totalGuildProfit: 0,
            guildLevel: 1,
            sharedPool: 0,
        };

        state.setGuilds([...state.availableGuilds, newGuild]);
    }

    private updateLeaderboard() {
        const state = this.getState();
        const currentLeaderboard = state.globalLeaderboard;

        // Simulate leaderboard changes
        const updatedLeaderboard: LeaderboardEntry[] = currentLeaderboard.map((entry) => {
            // Skip updating current user
            if (entry.isCurrentUser) return entry;

            // Random small changes to simulate activity
            const profitChange = Math.floor(Math.random() * 1000) - 500; // -500 to +500
            const newProfit = Math.max(0, entry.totalProfit + profitChange);

            return {
                ...entry,
                totalProfit: newProfit,
                winRate: Math.min(100, Math.max(0, entry.winRate + (Math.random() - 0.5) * 2)),
            };
        });

        // Sort by total profit
        updatedLeaderboard.sort((a, b) => b.totalProfit - a.totalProfit);
        updatedLeaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Update current user's position
        const userEntry = updatedLeaderboard.find((e) => e.isCurrentUser);
        if (userEntry) {
            const totalProfit = state.player.totalEarned - state.player.totalSpent;
            userEntry.totalProfit = totalProfit;
            userEntry.level = state.player.level;
            userEntry.winRate = state.player.marketsParticipated > 0
                ? (state.player.marketsWon / state.player.marketsParticipated) * 100
                : 0;

            // Re-sort after updating user
            updatedLeaderboard.sort((a, b) => b.totalProfit - a.totalProfit);
            updatedLeaderboard.forEach((entry, index) => {
                entry.rank = index + 1;
            });
        }

        state.setLeaderboard(updatedLeaderboard, state.guildLeaderboard);
    }
}

// Singleton instance
export const mockModeService = new MockModeService();

// Helper to check if mock mode is enabled
export const isMockModeEnabled = () => {
    return mockModeService["isRunning"];
};

// Helper to toggle mock mode
export const toggleMockMode = (enabled: boolean, config?: Partial<MockModeConfig>) => {
    if (enabled) {
        mockModeService.start(config);
    } else {
        mockModeService.stop();
    }
};

