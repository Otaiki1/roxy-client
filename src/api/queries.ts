import { useWalletStore } from "@/store/wallet";

function request(query: string): Promise<any> {
  const APP_ID =
    (import.meta as any).env.VITE_LINERA_APPLICATION_ID ||
    (import.meta as any).env.VITE_MICROCHESS_APPLICATION_ID;

  const ready = useWalletStore.getState().ready;
  const requestAsync = useWalletStore.getState().requestAsync;

  if (!ready) {
    console.log("Server NOT READY!");
    return Promise.reject("Server not ready");
  }

  return requestAsync({
    type: "QUERY",
    applicationId: APP_ID,
    query: query,
  });
}

// ============================================================================
// Player Operations
// ============================================================================

export function registerPlayer(displayName?: string): Promise<any> {
  const mutation = displayName
    ? `mutation { registerPlayer(displayName: "${displayName}") }`
    : `mutation { registerPlayer }`;
  return request(JSON.stringify({ query: mutation }));
}

export function updateProfile(displayName?: string): Promise<any> {
  const mutation = displayName
    ? `mutation { updateProfile(displayName: "${displayName}") }`
    : `mutation { updateProfile }`;
  return request(JSON.stringify({ query: mutation }));
}

export function getProfile(): Promise<any> {
  const query = `query { 
    profile {
      id
      displayName
      tokenBalance
      level
      totalPoints
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function getPlayer(playerId: string): Promise<any> {
  const query = `query {
    player(playerId: "${playerId}") {
      id
      displayName
      tokenBalance
      level
      totalPoints
    }
  }`;
  return request(JSON.stringify({ query: query }));
}

export function playerTotalPoints(playerId: string): Promise<any> {
  const query = `query { playerTotalPoints(playerId: "${playerId}") }`;
  return request(JSON.stringify({ query: query }));
}

// ============================================================================
// Daily Reward Operations
// ============================================================================

export function claimDailyReward(): Promise<any> {
  const mutation = `mutation { claimDailyReward }`;
  return request(JSON.stringify({ query: mutation }));
}

// ============================================================================
// Market Operations
// ============================================================================

export function createMarket(
  title: string,
  amount: string,
  feePercent: number
): Promise<any> {
  const mutation = `mutation { 
    createMarket(
      title: "${title}", 
      amount: "${amount}", 
      feePercent: ${feePercent}
    ) 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

export function buyShares(marketId: number, amount: string): Promise<any> {
  const mutation = `mutation { 
    buyShares(marketId: ${marketId}, amount: "${amount}") 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

export function sellShares(marketId: number, amount: string): Promise<any> {
  const mutation = `mutation { 
    sellShares(marketId: ${marketId}, amount: "${amount}") 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

// ============================================================================
// Guild Operations
// ============================================================================

export function createGuild(name: string): Promise<any> {
  const mutation = `mutation { createGuild(name: "${name}") }`;
  return request(JSON.stringify({ query: mutation }));
}

export function joinGuild(guildId: number): Promise<any> {
  const mutation = `mutation { joinGuild(guildId: ${guildId}) }`;
  return request(JSON.stringify({ query: mutation }));
}

export function leaveGuild(): Promise<any> {
  const mutation = `mutation { leaveGuild }`;
  return request(JSON.stringify({ query: mutation }));
}

export function contributeToGuild(amount: string): Promise<any> {
  const mutation = `mutation { contributeToGuild(amount: "${amount}") }`;
  return request(JSON.stringify({ query: mutation }));
}

export function getAllGuilds(): Promise<any> {
  const query = `query { 
    allGuilds { 
      id 
      name 
      founder 
      totalPoints
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function getGuildMembers(guildId: number): Promise<any> {
  const query = `query { 
    guildMembers(guildId: ${guildId}) { 
      id 
      displayName 
      tokenBalance 
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function guildTotalPoints(guildId: number): Promise<any> {
  const query = `query { guildTotalPoints(guildId: ${guildId}) }`;
  return request(JSON.stringify({ query: query }));
}

// ============================================================================
// Prediction Operations
// ============================================================================

export type PriceOutcome = "Rise" | "Fall" | "Neutral";

export function predictDailyOutcome(outcome: PriceOutcome): Promise<any> {
  const mutation = `mutation { 
    predictDailyOutcome(outcome: ${outcome}) 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

export function predictWeeklyOutcome(outcome: PriceOutcome): Promise<any> {
  const mutation = `mutation { 
    predictWeeklyOutcome(outcome: ${outcome}) 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

export function predictMonthlyOutcome(outcome: PriceOutcome): Promise<any> {
  const mutation = `mutation { 
    predictMonthlyOutcome(outcome: ${outcome}) 
  }`;
  return request(JSON.stringify({ query: mutation }));
}

export function getDailyOutcome(playerId: string): Promise<any> {
  const query = `query { getDailyOutcome(playerId: "${playerId}") }`;
  return request(JSON.stringify({ query: query }));
}

export function getWeeklyOutcome(playerId: string): Promise<any> {
  const query = `query { getWeeklyOutcome(playerId: "${playerId}") }`;
  return request(JSON.stringify({ query: query }));
}

export function getMonthlyOutcome(playerId: string): Promise<any> {
  const query = `query { getMonthlyOutcome(playerId: "${playerId}") }`;
  return request(JSON.stringify({ query: query }));
}

// ============================================================================
// Global Queries
// ============================================================================

export function getTotalSupply(): Promise<any> {
  const query = `query { totalSupply }`;
  return request(JSON.stringify({ query: query }));
}

export function getGlobalPlayers(): Promise<any> {
  const query = `query { 
    globalPlayers { 
      playerId 
      displayName 
      level 
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function getGlobalGuilds(): Promise<any> {
  const query = `query { 
    globalGuilds { 
      guildId 
      name 
      founder 
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function getGlobalMarkets(): Promise<any> {
  const query = `query { 
    globalMarkets { 
      marketId 
      title 
      creator 
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

export function getGlobalLeaderboard(): Promise<any> {
  const query = `query { 
    globalLeaderboard { 
      topTraders { 
        playerId 
        displayName 
        totalProfit 
        level 
      } 
      lastUpdated 
    } 
  }`;
  return request(JSON.stringify({ query: query }));
}

// ============================================================================
// Admin Operations (if needed)
// ============================================================================

export function mintPoints(amount: string): Promise<any> {
  const mutation = `mutation { mintPoints(amount: "${amount}") }`;
  return request(JSON.stringify({ query: mutation }));
}

export function updateMarketPrice(price: string): Promise<any> {
  const mutation = `mutation { updateMarketPrice(price: "${price}") }`;
  return request(JSON.stringify({ query: mutation }));
}

