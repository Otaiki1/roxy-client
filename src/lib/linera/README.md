# Linera Integration

This directory contains the Linera wallet and application integration for the Roxy client.

## Structure

- `constants.ts` - Configuration constants (RPC URLs, app IDs, etc.)
- `lib/` - Low-level adapters
  - `linera-adapter.ts` - Main adapter for Linera SDK operations
  - `dynamic-signer.ts` - Signer implementation bridging Dynamic wallets with Linera
- `services/` - High-level services
  - `LineraService.ts` - Application-specific service methods
- `hooks/` - React hooks
  - `useAuth.ts` - Authentication and connection state hook
  - `useLineraQueries.ts` - React Query hooks for Linera data

## Usage

### Basic Connection

```typescript
import { useAuth } from "@/lib/linera/hooks/useAuth";

function MyComponent() {
  const { isLoggedIn, isConnectedToLinera, showConnectWallet } = useAuth();

  if (!isLoggedIn) {
    return <button onClick={showConnectWallet}>Connect Wallet</button>;
  }

  return <div>Connected: {isConnectedToLinera}</div>;
}
```

### Making Application Queries

```typescript
import { LineraService } from "@/lib/linera/services/LineraService";

const service = LineraService.getInstance();
const puzzle = await service.getPuzzle("puzzle-123");
```

### Using React Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { LineraService } from "@/lib/linera/services/LineraService";
import { useAuth } from "@/lib/linera/hooks/useAuth";

function PuzzleComponent({ puzzleId }: { puzzleId: string }) {
  const { isConnectedToLinera } = useAuth();
  const service = LineraService.getInstance();

  const { data: puzzle } = useQuery({
    queryKey: ["puzzle", puzzleId],
    queryFn: () => service.getPuzzle(puzzleId),
    enabled: !!puzzleId && isConnectedToLinera,
  });

  return <div>{puzzle?.title}</div>;
}
```

## Environment Variables

Set these in your `.env` file:

```env
VITE_LINERA_RPC_URL=https://faucet.testnet-conway.linera.net/
VITE_LINERA_APP_ID=your_app_id
VITE_LINERA_PREVIOUS_APP_IDS=id1,id2,id3
VITE_LINERA_SCORING_CHAIN_IDS=chain1,chain2
VITE_DYNAMIC_SANDBOX_ENVIRONMENT_ID=your_sandbox_id
VITE_DYNAMIC_LIVE_ENVIRONMENT_ID=your_live_id
```

## Components

- `WalletConnect` - UI component for wallet connection (in `src/components/wallet/`)

