/**
 * GraphQL queries and mutations for the predictive_manager contract
 */

// ===== Queries =====

export const GET_PLAYER_QUERY = `
    query GetPlayer($playerId: String!) {
        player(playerId: $playerId) {
            id
            displayName
            tokenBalance
            level
            experiencePoints
            totalEarned
            totalSpent
            reputation
            marketsParticipated
            marketsWon
            totalProfit
            winStreak
            bestWinStreak
            guildId
            lastLogin
        }
    }
`;

export const GET_PLAYER_TOTAL_POINTS_QUERY = `
    query GetPlayerTotalPoints($playerId: String!) {
        playerTotalPoints(playerId: $playerId)
    }
`;

export const GET_DAILY_OUTCOME_QUERY = `
    query GetDailyOutcome($playerId: String!) {
        getDailyOutcome(playerId: $playerId)
    }
`;

export const GET_WEEKLY_OUTCOME_QUERY = `
    query GetWeeklyOutcome($playerId: String!) {
        getWeeklyOutcome(playerId: $playerId)
    }
`;

export const GET_MONTHLY_OUTCOME_QUERY = `
    query GetMonthlyOutcome($playerId: String!) {
        getMonthlyOutcome(playerId: $playerId)
    }
`;

export const GET_GLOBAL_LEADERBOARD_QUERY = `
    query GetGlobalLeaderboard {
        globalLeaderboard {
            topTraders {
                playerId
                displayName
                totalProfit
                level
            }
            lastUpdated
        }
    }
`;

export const GET_ALL_GUILDS_QUERY = `
    query GetAllGuilds {
        allGuilds {
            id
            name
            founder
            members {
                id
                displayName
                tokenBalance
            }
            creationTime
            totalGuildProfit
            guildLevel
            sharedPool
        }
    }
`;

export const GET_GUILD_MEMBERS_QUERY = `
    query GetGuildMembers($guildId: Int!) {
        guildMembers(guildId: $guildId) {
            id
            displayName
            tokenBalance
        }
    }
`;

export const GET_GUILD_TOTAL_POINTS_QUERY = `
    query GetGuildTotalPoints($guildId: Int!) {
        guildTotalPoints(guildId: $guildId)
    }
`;

export const GET_TOTAL_SUPPLY_QUERY = `
    query GetTotalSupply {
        totalSupply
    }
`;

// ===== Mutations =====

export const REGISTER_PLAYER_MUTATION = `
    mutation RegisterPlayer($displayName: String) {
        registerPlayer(displayName: $displayName)
    }
`;

export const UPDATE_PROFILE_MUTATION = `
    mutation UpdateProfile($displayName: String) {
        updateProfile(displayName: $displayName)
    }
`;

export const CLAIM_DAILY_REWARD_MUTATION = `
    mutation ClaimDailyReward {
        claimDailyReward
    }
`;

export const PREDICT_DAILY_OUTCOME_MUTATION = `
    mutation PredictDailyOutcome($outcome: PriceOutcome!) {
        predictDailyOutcome(outcome: $outcome)
    }
`;

export const PREDICT_WEEKLY_OUTCOME_MUTATION = `
    mutation PredictWeeklyOutcome($outcome: PriceOutcome!) {
        predictWeeklyOutcome(outcome: $outcome)
    }
`;

export const PREDICT_MONTHLY_OUTCOME_MUTATION = `
    mutation PredictMonthlyOutcome($outcome: PriceOutcome!) {
        predictMonthlyOutcome(outcome: $outcome)
    }
`;

