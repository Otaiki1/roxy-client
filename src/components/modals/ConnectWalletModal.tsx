import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { featureFlags } from "@/config/featureFlags";
import { LuCircleCheck, LuLoader, LuZap, LuLink2 } from "react-icons/lu";

interface ConnectWalletModalProps {
    forceOpen?: boolean;
}

type OnboardingStep = "intro" | "connecting" | "success";

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.25 },
    },
    exit: { opacity: 0, scale: 0.97, y: -10 },
};

export function ConnectWalletModal({ forceOpen }: ConnectWalletModalProps) {
    const {
        isAuthenticated,
        isLineraReady,
        connect,
        isLoading,
        error,
        chainId,
    } = useWallet();
    const [onboardingStep, setOnboardingStep] =
        useState<OnboardingStep>("intro");
    const [hasStartedConnection, setHasStartedConnection] = useState(false);

    // Show modal if not authenticated, or if we're showing success (will auto-close)
    const shouldShow =
        forceOpen ||
        !isAuthenticated ||
        !isLineraReady ||
        Boolean(error) ||
        isLoading ||
        (onboardingStep === "success" && isAuthenticated);

    // Track onboarding progress
    useEffect(() => {
        if (hasStartedConnection && isLoading) {
            setOnboardingStep("connecting");
        } else if (isAuthenticated && isLineraReady && chainId) {
            setOnboardingStep("success");
            // Auto-close modal after showing success for 2 seconds
            const timer = setTimeout(() => {
                setOnboardingStep("intro");
                setHasStartedConnection(false);
            }, 2000);
            return () => clearTimeout(timer);
        } else if (!hasStartedConnection && !isAuthenticated) {
            setOnboardingStep("intro");
        }
    }, [
        hasStartedConnection,
        isLoading,
        isAuthenticated,
        isLineraReady,
        chainId,
    ]);

    const handleConnect = async () => {
        setHasStartedConnection(true);
        setOnboardingStep("connecting");
        await connect();
    };

    const formatChainId = (id?: string) => {
        if (!id) return "Generating...";
        // Chain ID is typically a hex string, show first 8 and last 6 chars
        if (id.length > 14) {
            return `${id.slice(0, 8)}...${id.slice(-6)}`;
        }
        return id;
    };

    const copyChainId = async () => {
        if (chainId) {
            try {
                await navigator.clipboard.writeText(chainId);
                alert("Chain ID copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy chain ID:", err);
            }
        }
    };

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-6"
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        variants={modalVariants}
                        className="card-brutal border-neon-primary relative w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] 2xl:w-[55vw] max-w-6xl overflow-hidden rounded-none p-6 sm:p-8 md:p-10 lg:p-12 text-center"
                    >
                        <div className="mx-auto flex w-full flex-col gap-6">
                            {/* Step 1: Introduction */}
                            {onboardingStep === "intro" && (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 bg-primary border-brutal flex items-center justify-center">
                                                <LuZap className="w-8 h-8 text-black" />
                                            </div>
                                        </div>
                                        <h2 className="font-brutal text-2xl text-primary sm:text-3xl">
                                            Welcome to Linera
                                        </h2>
                                        <div className="space-y-3 text-left">
                                            <p className="text-sm font-mono-brutal text-text-muted">
                                                You're about to connect to a{" "}
                                                <span className="text-primary font-brutal">
                                                    Linera application
                                                </span>
                                                . Linera is a blockchain
                                                platform that creates a personal
                                                microchain for each user.
                                            </p>
                                            <div className="bg-black border-brutal p-4 space-y-2">
                                                <p className="text-xs font-brutal text-primary uppercase">
                                                    What happens next:
                                                </p>
                                                <ul className="text-xs font-mono-brutal text-text-muted space-y-1 list-disc list-inside">
                                                    <li>
                                                        A secure wallet will be
                                                        created for you
                                                    </li>
                                                    <li>
                                                        A personal Linera chain
                                                        will be generated
                                                    </li>
                                                    <li>
                                                        Your unique Chain ID
                                                        will be your identity
                                                    </li>
                                                    <li>
                                                        No external wallet
                                                        needed - it's all
                                                        automatic!
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleConnect}
                                            className="w-full border-neon-accent px-6 py-3 font-brutal uppercase transition hover:opacity-90 sm:w-auto"
                                        >
                                            Create My Linera Chain
                                        </button>
                                        <p className="text-xs font-mono-brutal text-text-muted">
                                            This process is secure and happens
                                            automatically
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Connecting */}
                            {onboardingStep === "connecting" && (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <LuLoader className="w-12 h-12 text-primary animate-spin" />
                                        </div>
                                        <h2 className="font-brutal text-2xl text-primary sm:text-3xl">
                                            Setting Up Your Linera Chain
                                        </h2>
                                        <p className="text-xs font-mono-brutal text-text-muted">
                                            This may take 30-60 seconds. The
                                            client is downloading blockchain
                                            data...
                                        </p>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="flex-1 bg-black border-brutal p-3 text-left">
                                                    <p className="text-xs font-mono-brutal text-text-muted mb-1">
                                                        Step 1: Creating wallet
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {isLoading ? (
                                                            <>
                                                                <LuLoader className="w-4 h-4 text-primary animate-spin" />
                                                                <span className="text-sm font-brutal text-primary">
                                                                    In
                                                                    progress...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuCircleCheck className="w-4 h-4 text-primary" />
                                                                <span className="text-sm font-brutal text-white">
                                                                    Complete
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="flex-1 bg-black border-brutal p-3 text-left">
                                                    <p className="text-xs font-mono-brutal text-text-muted mb-1">
                                                        Step 2: Claiming your
                                                        chain
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {isLoading ? (
                                                            <>
                                                                <LuLoader className="w-4 h-4 text-primary animate-spin" />
                                                                <span className="text-sm font-brutal text-primary">
                                                                    In
                                                                    progress...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuCircleCheck className="w-4 h-4 text-primary" />
                                                                <span className="text-sm font-brutal text-white">
                                                                    Complete
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="flex-1 bg-black border-brutal p-3 text-left">
                                                    <p className="text-xs font-mono-brutal text-text-muted mb-1">
                                                        Step 3: Connecting to
                                                        application
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {isLoading ? (
                                                            <>
                                                                <LuLoader className="w-4 h-4 text-primary animate-spin" />
                                                                <span className="text-sm font-brutal text-primary">
                                                                    In
                                                                    progress...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuCircleCheck className="w-4 h-4 text-primary" />
                                                                <span className="text-sm font-brutal text-white">
                                                                    Complete
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="flex-1 bg-black border-brutal p-3 text-left">
                                                    <p className="text-xs font-mono-brutal text-text-muted mb-1">
                                                        Step 4: Syncing
                                                        blockchain data
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {isLoading ? (
                                                            <>
                                                                <LuLoader className="w-4 h-4 text-primary animate-spin" />
                                                                <span className="text-sm font-brutal text-primary">
                                                                    Downloading
                                                                    blobs...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuCircleCheck className="w-4 h-4 text-primary" />
                                                                <span className="text-sm font-brutal text-white">
                                                                    Complete
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isLoading && (
                                            <div className="bg-black/50 border border-primary/50 p-3 mt-4">
                                                <p className="text-xs font-mono-brutal text-text-muted text-center">
                                                    ⚠️ Background sync is
                                                    downloading blockchain data.
                                                    This is normal and may take
                                                    a minute.
                                                    <br />
                                                    The app will be ready once
                                                    the initial sync completes.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Step 3: Success */}
                            {onboardingStep === "success" && chainId && (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <LuCircleCheck className="w-16 h-16 text-primary" />
                                        </div>
                                        <h2 className="font-brutal text-2xl text-primary sm:text-3xl">
                                            Welcome to Your Linera Chain!
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="bg-black border-brutal p-6 space-y-3">
                                                <p className="text-xs font-brutal text-primary uppercase">
                                                    Your Chain ID
                                                </p>
                                                <div
                                                    className="flex items-center justify-between gap-4 p-3 bg-black border border-primary cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={copyChainId}
                                                    title="Click to copy full Chain ID"
                                                >
                                                    <code className="text-sm font-mono-brutal text-primary flex-1 text-left">
                                                        {formatChainId(chainId)}
                                                    </code>
                                                    <LuLink2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <p className="text-xs font-mono-brutal text-text-muted text-left">
                                                    This is your unique
                                                    identifier on Linera. Your
                                                    personal microchain is now
                                                    active!
                                                </p>
                                            </div>
                                            <div className="bg-black border-brutal p-4 text-left">
                                                <p className="text-xs font-brutal text-primary uppercase mb-2">
                                                    What is Linera?
                                                </p>
                                                <p className="text-xs font-mono-brutal text-text-muted">
                                                    Linera creates a personal
                                                    blockchain (microchain) for
                                                    each user. This means you
                                                    have your own secure, fast
                                                    blockchain that's connected
                                                    to the Linera network. No
                                                    gas fees, instant
                                                    transactions, and complete
                                                    control.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-sm font-mono-brutal text-primary">
                                            ✓ You're all set! The app will load
                                            automatically.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Error State */}
                            {error && onboardingStep !== "success" && (
                                <div className="bg-red-900/20 border border-red-500 p-4 space-y-3">
                                    <div>
                                        <p className="text-xs font-brutal text-red-400 uppercase mb-2">
                                            Connection Error
                                        </p>
                                        <p className="text-xs font-mono-brutal text-red-400">
                                            {error}
                                        </p>
                                    </div>
                                    <div className="bg-black/50 border border-red-500/50 p-3 text-left">
                                        <p className="text-xs font-brutal text-red-300 uppercase mb-1">
                                            Troubleshooting Tips:
                                        </p>
                                        <ul className="text-xs font-mono-brutal text-red-400/80 space-y-1 list-disc list-inside">
                                            <li>
                                                Check your internet connection
                                            </li>
                                            <li>
                                                Verify the Linera faucet is
                                                accessible
                                            </li>
                                            <li>Try refreshing the page</li>
                                            <li>
                                                Wait a few moments and try again
                                            </li>
                                        </ul>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleConnect}
                                        className="w-full border border-red-500 bg-red-900/20 px-4 py-2 text-xs font-brutal text-red-400 uppercase hover:bg-red-900/30 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {featureFlags.USE_GAME_HUD &&
                                onboardingStep === "intro" && (
                                    <p className="text-xs font-mono-brutal text-text-muted">
                                        Wallet required to render live stats in
                                        the HUD.
                                    </p>
                                )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConnectWalletModal;
