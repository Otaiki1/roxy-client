import { useState, useEffect } from "react";
import { useWalletStore } from "@/store/wallet";
import { getProfile } from "@/api/queries";
import { LuLoader, LuCircleCheck, LuZap } from "react-icons/lu";

export default function WalletSheet() {
  const walletExists = useWalletStore((s) => s.walletExists);
  const ready = useWalletStore((s) => s.ready);
  const createWallet = useWalletStore((s) => s.createWalletAsync);
  const initWallet = useWalletStore((s) => s.initAsync);
  const getJsWallet = useWalletStore((s) => s.getJsWalletAsync);
  const checkWalletExist = useWalletStore((s) => s.checkWalletExistAsync);
  const [isCreating, setIsCreating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [refetch] = useState(0); // Keep for dependency array

  // Check wallet existence on mount
  useEffect(() => {
    checkWalletExist();
  }, [checkWalletExist]);

  // Initialize wallet if it exists
  useEffect(() => {
    if (walletExists && !ready) {
      initWallet();
    }
  }, [walletExists, ready, initWallet]);

  // Fetch wallet info and profile after wallet is ready
  useEffect(() => {
    if (!walletExists) return;

    const fetchWallet = async () => {
      await getJsWallet();
    };

    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (!res) {
          console.warn("No response from getProfile");
          return;
        }

        // Check if response has error
        if (res.success === false || res.error) {
          console.warn("Profile query failed:", res.error || "Unknown error");
          return;
        }

        // Handle different response structures
        let result = res.result || res;
        
        // If result is already an object, use it directly
        if (typeof result === 'object' && result !== null) {
          if (result.data && result.data.profile) {
            setProfile(result.data.profile);
          } else if (result.profile) {
            setProfile(result.profile);
          }
          return;
        }

        // If result is a string, try to parse it
        if (typeof result === 'string') {
          // Skip if empty or whitespace
          if (!result.trim()) {
            console.warn("Empty profile response");
            return;
          }

          // Check if it looks like JSON
          const trimmed = result.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              const parsed = JSON.parse(result);
              if (parsed.data && parsed.data.profile) {
                setProfile(parsed.data.profile);
              } else if (parsed.profile) {
                setProfile(parsed.profile);
              } else if (parsed.errors) {
                console.warn("GraphQL errors in profile response:", parsed.errors);
              }
            } catch (parseError) {
              // Response might be an error message, HTML, or malformed JSON
              console.warn("Failed to parse profile response as JSON. First 200 chars:", result.substring(0, 200));
              console.warn("Parse error:", parseError);
            }
          } else {
            // Not JSON, might be an error message or HTML
            console.warn("Profile response doesn't look like JSON. First 200 chars:", result.substring(0, 200));
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Don't set profile on error - component will handle missing profile gracefully
      }
    };

    fetchWallet();
    if (ready) {
      fetchProfile();
    }
  }, [walletExists, ready, refetch, getJsWallet]);

  const GetStarted = () => {
    const handleCreate = async () => {
      setIsCreating(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([createWallet(), minDelay]);
      setIsCreating(false);
    };

    if (isCreating) {
      return (
        <div className="space-y-4 p-6">
          <div className="flex justify-center">
            <LuLoader className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="font-brutal text-2xl text-primary text-center">
            Creating Your Wallet
          </h2>
          <div className="space-y-3">
            <LoadingStep
              label="Creating wallet"
              isLoading={isCreating}
            />
            <LoadingStep
              label="Initializing client"
              isLoading={isCreating}
            />
            <LoadingStep
              label="Syncing chain"
              isLoading={isCreating}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary border-brutal flex items-center justify-center">
            <LuZap className="w-8 h-8 text-black" />
          </div>
        </div>
        <h2 className="font-brutal text-2xl text-primary">
          Get Started
        </h2>
        <p className="text-sm font-mono-brutal text-text-muted">
          Create your Linera wallet to start using the app
        </p>
        <button
          onClick={handleCreate}
          className="w-full border-neon-accent px-6 py-3 font-brutal uppercase transition hover:opacity-90"
        >
          Start Now
        </button>
      </div>
    );
  };

  const PlayerProfile = () => {
    const chains = useWalletStore((s) => s.chains);
    const pubKey = useWalletStore((s) => s.pubKey);
    const chainBalance = useWalletStore((s) => s.chainBalance);
    const defaultChain = useWalletStore((s) => s.defaultChain);

    return (
      <div className="space-y-4 p-6">
        <div className="bg-black border-brutal p-4">
          <h3 className="font-brutal text-lg text-primary mb-2">Profile</h3>
          {profile ? (
            <div className="space-y-2 text-sm">
              <p className="font-mono-brutal text-text-muted">
                Name: <span className="text-primary">{profile.displayName || "N/A"}</span>
              </p>
              <p className="font-mono-brutal text-text-muted">
                Level: <span className="text-primary">{profile.level || 0}</span>
              </p>
              <p className="font-mono-brutal text-text-muted">
                Balance: <span className="text-primary">{chainBalance}</span>
              </p>
              <p className="font-mono-brutal text-text-muted">
                Points: <span className="text-primary">{profile.totalPoints || 0}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm font-mono-brutal text-text-muted">
              Loading profile...
            </p>
          )}
        </div>

        {chains && chains.length > 0 && (
          <div className="bg-black border-brutal p-4">
            <h3 className="font-brutal text-lg text-primary mb-2">Chains</h3>
            <div className="space-y-2 text-sm">
              {chains.map((chain) => (
                <div
                  key={chain.chainId}
                  className={`p-2 border ${
                    chain.chainId === defaultChain
                      ? "border-primary"
                      : "border-text-muted"
                  }`}
                >
                  <p className="font-mono-brutal text-text-muted">
                    Chain: <span className="text-primary">{chain.chainId.slice(0, 8)}...</span>
                  </p>
                  <p className="font-mono-brutal text-text-muted text-xs">
                    Owner: {chain.owner.slice(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pubKey && (
          <div className="bg-black border-brutal p-4">
            <h3 className="font-brutal text-lg text-primary mb-2">Public Key</h3>
            <p className="text-xs font-mono-brutal text-primary break-all">
              {pubKey}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!walletExists) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-background border-brutal border-neon-primary shadow-lg">
          <GetStarted />
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-background border-brutal border-neon-primary shadow-lg p-6">
          <div className="flex items-center gap-3">
            <LuLoader className="w-6 h-6 text-primary animate-spin" />
            <p className="font-mono-brutal text-sm text-text-muted">
              Loading wallet...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-background border-brutal border-neon-primary shadow-lg">
        <PlayerProfile />
      </div>
    </div>
  );
}

function LoadingStep({
  label,
  isLoading,
}: {
  label: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-black border-brutal">
      <p className="text-xs font-mono-brutal text-text-muted flex-1">{label}</p>
      {isLoading ? (
        <>
          <LuLoader className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm font-brutal text-primary">In progress...</span>
        </>
      ) : (
        <>
          <LuCircleCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-brutal text-white">Complete</span>
        </>
      )}
    </div>
  );
}

