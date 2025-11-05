# Contract-Frontend Alignment Analysis

## Critical Issues Found

### 1. **Buy Shares Logic Mismatch** ❌
**Contract**: When buying shares, player:
- Pays `basePayment + fee`
- **Receives** `points_to_receive` which are added to their balance
- Market creator gets `basePayment + 98% of fee`
- Platform gets `2% of fee`

**Frontend**: Currently:
- Deducts payment correctly ✅
- **BUT doesn't add received points to balance** ❌
- Doesn't distribute fees to creator ❌

**Fix Needed**: Add received points to player balance after purchase.

### 2. **Market Positions Structure Mismatch** ⚠️
**Contract**: Uses `PlayerPosition` struct with:
- `shares_by_outcome: BTreeMap<OutcomeId, Amount>`
- `total_invested: Amount`
- `entry_time: Timestamp`

**Frontend**: Uses simple `Record<string, number>` (just amount)

**Note**: For point trading markets, the contract doesn't use `shares_by_outcome` (it's for traditional prediction markets), so this is acceptable for now.

### 3. **Sell Shares Logic Mismatch** ❌
**Contract**: When selling:
- Player burns `amount` points (deducts from balance)
- Market creator gets `98% of fee`
- Platform gets `2% of fee`
- Points are burned from total supply (net after fee)
- Market liquidity increases by `points_for_market` (amount minus fee)

**Frontend**: Currently:
- Simplifies to receiving 90% back ❌
- Doesn't properly handle fee distribution ❌

### 4. **Leaderboard Ranking** ⚠️
**Contract**: Ranks by `total_earned` (total points earned), not `total_profit`

**Frontend**: Shows `total_profit` (total_earned - total_spent)

**Note**: This is a display choice, but should align with contract's leaderboard logic.

### 5. **Daily Reward Cooldown** ❌
**Contract**: Checks 24-hour cooldown using `last_login` timestamp

**Frontend**: Always allows claiming (no cooldown check)

### 6. **Guild Prediction Rewards** ❌
**Contract**: When a guild member makes correct/wrong prediction:
- ALL guild members get rewards/penalties
- Rewards distributed proportionally

**Frontend**: Doesn't show guild reward effects

### 7. **Price Prediction Resolution** ⚠️
**Contract**: Predictions are resolved when:
- Period expires (24h/7d/30d)
- Admin/oracle calls `update_market_price`
- Compares `end_price` to `initial_price` from crypto API

**Frontend**: Predictions are created but never automatically resolved

### 8. **Market Creation Fee Distribution** ⚠️
**Contract**: Creation cost (100 points) goes to platform total supply

**Frontend**: Deducts but doesn't track total supply

## Recommended Fixes

### Priority 1 (Critical)
1. Fix buy shares to add received points to balance
2. Implement proper daily reward cooldown check
3. Fix sell shares to match contract logic

### Priority 2 (Important)
4. Add guild reward/penalty display for predictions
5. Update leaderboard to rank by `total_earned` (as contract does)
6. Add total supply tracking

### Priority 3 (Nice to have)
7. Add price update mechanism (admin/oracle simulation)
8. Add prediction resolution simulation
9. Show fee distribution details

