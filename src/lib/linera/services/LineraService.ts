import { lineraAdapter } from "../lib/linera-adapter";
import { PREDICTIVE_MANAGER_APP_ID, PREVIOUS_APP_IDS } from "../constants";
import type {
    Player,
    PriceOutcome,
    PlayerQueryResponse,
    PlayerTotalPointsResponse,
    DailyOutcomeResponse,
    WeeklyOutcomeResponse,
    MonthlyOutcomeResponse,
    GlobalLeaderboardResponse,
    AllGuildsResponse,
    GuildMembersResponse,
    GuildTotalPointsResponse,
} from "../types";
import {
    GET_PLAYER_QUERY,
    GET_PLAYER_TOTAL_POINTS_QUERY,
    GET_DAILY_OUTCOME_QUERY,
    GET_WEEKLY_OUTCOME_QUERY,
    GET_MONTHLY_OUTCOME_QUERY,
    GET_GLOBAL_LEADERBOARD_QUERY,
    GET_ALL_GUILDS_QUERY,
    GET_GUILD_MEMBERS_QUERY,
    GET_GUILD_TOTAL_POINTS_QUERY,
    REGISTER_PLAYER_MUTATION,
    UPDATE_PROFILE_MUTATION,
    CLAIM_DAILY_REWARD_MUTATION,
    PREDICT_DAILY_OUTCOME_MUTATION,
    PREDICT_WEEKLY_OUTCOME_MUTATION,
    PREDICT_MONTHLY_OUTCOME_MUTATION,
} from "../queries";
import { amountToPoints } from "../utils/amount";

export class LineraService {
    private static instance: LineraService | null = null;
    private isInitialized: boolean = false;
    private chainId: string | null = null;

    private constructor() {}

    static getInstance(): LineraService {
        if (!LineraService.instance) {
            LineraService.instance = new LineraService();
        }
        return LineraService.instance;
    }

    private initializePromise: Promise<void> | null = null;

    /**
     * Initialize the service with a Dynamic wallet
     */
    async initialize(dynamicWallet: any): Promise<void> {
        // #region agent log
        fetch(
            "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: "LineraService.ts:56",
                    message: "initialize() called",
                    data: {
                        isInitialized: this.isInitialized,
                        hasInitPromise: !!this.initializePromise,
                        walletAddress: dynamicWallet?.address,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "C",
                }),
            }
        ).catch(() => {});
        // #endregion

        if (this.isInitialized) {
            // #region agent log
            fetch(
                "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "LineraService.ts:61",
                        message: "Already initialized - early return",
                        data: {
                            isInitialized: this.isInitialized,
                            chainId: this.chainId,
                        },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "C",
                    }),
                }
            ).catch(() => {});
            // #endregion
            console.log("LineraService already initialized");
            return;
        }

        // If already initializing, return the existing promise
        if (this.initializePromise) {
            // #region agent log
            fetch(
                "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "LineraService.ts:68",
                        message:
                            "Initialization already in progress - returning existing promise",
                        data: { hasInitPromise: !!this.initializePromise },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "C",
                    }),
                }
            ).catch(() => {});
            // #endregion
            return this.initializePromise;
        }

        // Create the initialization promise
        this.initializePromise = (async () => {
            try {
                // #region agent log
                fetch(
                    "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            location: "LineraService.ts:76",
                            message: "Starting initialization",
                            data: { walletAddress: dynamicWallet?.address },
                            timestamp: Date.now(),
                            sessionId: "debug-session",
                            runId: "run1",
                            hypothesisId: "C",
                        }),
                    }
                ).catch(() => {});
                // #endregion

                // Connect to Linera
                await lineraAdapter.connect(dynamicWallet);

                // Set applications
                await lineraAdapter.setApplications(
                    PREDICTIVE_MANAGER_APP_ID,
                    PREVIOUS_APP_IDS
                );

                // Get chain ID from adapter
                this.chainId = lineraAdapter.getChainId();

                this.isInitialized = true;
                console.log("LineraService initialized successfully");

                // #region agent log
                fetch(
                    "http://127.0.0.1:7242/ingest/e58d7062-0d47-477e-9656-193d36c038be",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            location: "LineraService.ts:95",
                            message: "Initialization completed",
                            data: {
                                isInitialized: this.isInitialized,
                                chainId: this.chainId,
                            },
                            timestamp: Date.now(),
                            sessionId: "debug-session",
                            runId: "run1",
                            hypothesisId: "C",
                        }),
                    }
                ).catch(() => {});
                // #endregion
            } catch (error) {
                console.error("Failed to initialize LineraService:", error);
                this.initializePromise = null; // Reset on error so it can retry
                throw error;
            } finally {
                this.initializePromise = null;
            }
        })();

        return this.initializePromise;
    }

    /**
     * Ensure service is initialized
     */
    async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error(
                "LineraService not initialized. Call initialize() first."
            );
        }
    }

    // ===== Player Operations =====

    /**
     * Register a new player
     */
    async registerPlayer(displayName?: string): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: REGISTER_PLAYER_MUTATION,
            variables: {
                displayName: displayName || null,
            },
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                registerPlayer: boolean;
            }>(query);

            if (result.errors) {
                console.error("Register player errors:", result.errors);
                return false;
            }

            return result.data?.registerPlayer || false;
        } catch (error) {
            console.error("Failed to register player:", error);
            return false;
        }
    }

    /**
     * Update player profile
     */
    async updateProfile(displayName?: string): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: UPDATE_PROFILE_MUTATION,
            variables: {
                displayName: displayName || null,
            },
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                updateProfile: boolean;
            }>(query);

            if (result.errors) {
                console.error("Update profile errors:", result.errors);
                return false;
            }

            return result.data?.updateProfile || false;
        } catch (error) {
            console.error("Failed to update profile:", error);
            return false;
        }
    }

    /**
     * Claim daily reward
     */
    async claimDailyReward(): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: CLAIM_DAILY_REWARD_MUTATION,
            variables: {},
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                claimDailyReward: boolean;
            }>(query);

            if (result.errors) {
                console.error("Claim daily reward errors:", result.errors);
                return false;
            }

            return result.data?.claimDailyReward || false;
        } catch (error) {
            console.error("Failed to claim daily reward:", error);
            return false;
        }
    }

    // ===== Prediction Operations =====

    /**
     * Make a daily price prediction
     */
    async predictDailyOutcome(outcome: PriceOutcome): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: PREDICT_DAILY_OUTCOME_MUTATION,
            variables: {
                outcome,
            },
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                predictDailyOutcome: boolean;
            }>(query);

            if (result.errors) {
                console.error("Predict daily outcome errors:", result.errors);
                return false;
            }

            return result.data?.predictDailyOutcome || false;
        } catch (error) {
            console.error("Failed to predict daily outcome:", error);
            return false;
        }
    }

    /**
     * Make a weekly price prediction
     */
    async predictWeeklyOutcome(outcome: PriceOutcome): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: PREDICT_WEEKLY_OUTCOME_MUTATION,
            variables: {
                outcome,
            },
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                predictWeeklyOutcome: boolean;
            }>(query);

            if (result.errors) {
                console.error("Predict weekly outcome errors:", result.errors);
                return false;
            }

            return result.data?.predictWeeklyOutcome || false;
        } catch (error) {
            console.error("Failed to predict weekly outcome:", error);
            return false;
        }
    }

    /**
     * Make a monthly price prediction
     */
    async predictMonthlyOutcome(outcome: PriceOutcome): Promise<boolean> {
        await this.ensureInitialized();

        const query = {
            query: PREDICT_MONTHLY_OUTCOME_MUTATION,
            variables: {
                outcome,
            },
        };

        try {
            const result = await lineraAdapter.queryApplication<{
                predictMonthlyOutcome: boolean;
            }>(query);

            if (result.errors) {
                console.error("Predict monthly outcome errors:", result.errors);
                return false;
            }

            return result.data?.predictMonthlyOutcome || false;
        } catch (error) {
            console.error("Failed to predict monthly outcome:", error);
            return false;
        }
    }

    // ===== Query Methods =====

    /**
     * Get player data
     */
    async getPlayer(playerId: string): Promise<Player | null> {
        await this.ensureInitialized();

        const query = {
            query: GET_PLAYER_QUERY,
            variables: { playerId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<PlayerQueryResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get player errors:", result.errors);
                return null;
            }

            return result.data?.player || null;
        } catch (error) {
            console.error("Failed to get player:", error);
            return null;
        }
    }

    /**
     * Get player total points
     */
    async getPlayerTotalPoints(playerId: string): Promise<number> {
        await this.ensureInitialized();

        const query = {
            query: GET_PLAYER_TOTAL_POINTS_QUERY,
            variables: { playerId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<PlayerTotalPointsResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get player total points errors:", result.errors);
                return 0;
            }

            const pointsString = result.data?.playerTotalPoints;
            if (!pointsString) return 0;

            return amountToPoints(pointsString);
        } catch (error) {
            console.error("Failed to get player total points:", error);
            return 0;
        }
    }

    /**
     * Get daily prediction outcome (true if correct, false otherwise)
     */
    async getDailyOutcome(playerId: string): Promise<boolean | null> {
        await this.ensureInitialized();

        const query = {
            query: GET_DAILY_OUTCOME_QUERY,
            variables: { playerId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<DailyOutcomeResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get daily outcome errors:", result.errors);
                return null;
            }

            return result.data?.getDailyOutcome ?? null;
        } catch (error) {
            console.error("Failed to get daily outcome:", error);
            return null;
        }
    }

    /**
     * Get weekly prediction outcome
     */
    async getWeeklyOutcome(playerId: string): Promise<boolean | null> {
        await this.ensureInitialized();

        const query = {
            query: GET_WEEKLY_OUTCOME_QUERY,
            variables: { playerId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<WeeklyOutcomeResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get weekly outcome errors:", result.errors);
                return null;
            }

            return result.data?.getWeeklyOutcome ?? null;
        } catch (error) {
            console.error("Failed to get weekly outcome:", error);
            return null;
        }
    }

    /**
     * Get monthly prediction outcome
     */
    async getMonthlyOutcome(playerId: string): Promise<boolean | null> {
        await this.ensureInitialized();

        const query = {
            query: GET_MONTHLY_OUTCOME_QUERY,
            variables: { playerId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<MonthlyOutcomeResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get monthly outcome errors:", result.errors);
                return null;
            }

            return result.data?.getMonthlyOutcome ?? null;
        } catch (error) {
            console.error("Failed to get monthly outcome:", error);
            return null;
        }
    }

    /**
     * Get global leaderboard
     */
    async getGlobalLeaderboard(): Promise<
        GlobalLeaderboardResponse["globalLeaderboard"] | null
    > {
        await this.ensureInitialized();

        const query = {
            query: GET_GLOBAL_LEADERBOARD_QUERY,
            variables: {},
        };

        try {
            const result =
                await lineraAdapter.queryApplication<GlobalLeaderboardResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get global leaderboard errors:", result.errors);
                return null;
            }

            return result.data?.globalLeaderboard || null;
        } catch (error) {
            console.error("Failed to get global leaderboard:", error);
            return null;
        }
    }

    /**
     * Get all guilds (for future use)
     */
    async getAllGuilds(): Promise<AllGuildsResponse["allGuilds"]> {
        await this.ensureInitialized();

        const query = {
            query: GET_ALL_GUILDS_QUERY,
            variables: {},
        };

        try {
            const result =
                await lineraAdapter.queryApplication<AllGuildsResponse>(query);

            if (result.errors) {
                console.error("Get all guilds errors:", result.errors);
                return [];
            }

            return result.data?.allGuilds || [];
        } catch (error) {
            console.error("Failed to get all guilds:", error);
            return [];
        }
    }

    /**
     * Get guild members (for future use)
     */
    async getGuildMembers(
        guildId: number
    ): Promise<GuildMembersResponse["guildMembers"]> {
        await this.ensureInitialized();

        const query = {
            query: GET_GUILD_MEMBERS_QUERY,
            variables: { guildId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<GuildMembersResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get guild members errors:", result.errors);
                return [];
            }

            return result.data?.guildMembers || [];
        } catch (error) {
            console.error("Failed to get guild members:", error);
            return [];
        }
    }

    /**
     * Get guild total points (for future use)
     */
    async getGuildTotalPoints(guildId: number): Promise<number> {
        await this.ensureInitialized();

        const query = {
            query: GET_GUILD_TOTAL_POINTS_QUERY,
            variables: { guildId },
        };

        try {
            const result =
                await lineraAdapter.queryApplication<GuildTotalPointsResponse>(
                    query
                );

            if (result.errors) {
                console.error("Get guild total points errors:", result.errors);
                return 0;
            }

            const pointsString = result.data?.guildTotalPoints;
            if (!pointsString) return 0;

            return amountToPoints(pointsString);
        } catch (error) {
            console.error("Failed to get guild total points:", error);
            return 0;
        }
    }

    /**
     * Subscribe to notifications
     */
    onNotification(callback: (data: any) => void): void {
        lineraAdapter.onNewBlockNotification(callback);
    }

    /**
     * Get wallet information
     */
    getWalletInfo(): {
        chainId: string | null;
    } {
        return {
            chainId: this.chainId,
        };
    }

    /**
     * Disconnect from Linera
     */
    disconnect(): void {
        lineraAdapter.reset();
        this.isInitialized = false;
        this.chainId = null;
        console.log("LineraService disconnected");
    }
}
