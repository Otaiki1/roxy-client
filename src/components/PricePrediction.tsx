import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuTrendingUp as TrendingUp,
    LuTrendingDown as TrendingDown,
    LuMinus as Minus,
    LuCoins as Coins,
    LuZap as Zap,
    LuTarget as Target,
    LuArrowRight as ArrowRight,
} from "react-icons/lu";
import {
    useGameStore,
    type PriceOutcome,
    type PredictionPeriod,
    type Cryptocurrency,
} from "@/store/gameStore";
import { useAuth } from "@/lib/linera/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export function PricePrediction() {
    const { walletAddress } = useAuth();
    const queryClient = useQueryClient();
    const {
        player,
        predictions,
        cryptocurrencyPrices,
        predictDailyOutcome,
        predictWeeklyOutcome,
        predictMonthlyOutcome,
        error,
        setError,
        isLoading,
    } = useGameStore();

    const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency>("BTC");
    const [selectedPeriod, setSelectedPeriod] =
        useState<PredictionPeriod>("Daily");
    const [selectedOutcome, setSelectedOutcome] = useState<PriceOutcome | null>(
        null
    );
    const [stakeAmount, setStakeAmount] = useState<string>("");
    const [showModal, setShowModal] = useState(false);

    // Get active predictions
    const activePredictions = predictions.filter((p) => !p.resolved);
    const hasActivePrediction = activePredictions.some(
        (p) =>
            p.period === selectedPeriod && p.cryptocurrency === selectedCrypto
    );

    // Calculate potential rewards based on period
    const getRewardMultiplier = (period: PredictionPeriod): number => {
        switch (period) {
            case "Daily":
                return 2; // 2x return
            case "Weekly":
                return 3; // 3x return
            case "Monthly":
                return 5; // 5x return
        }
    };

    const rewardMultiplier = getRewardMultiplier(selectedPeriod);
    const stakeValue = parseFloat(stakeAmount) || 0;
    const potentialReward = stakeValue > 0 ? stakeValue * rewardMultiplier : 0;
    const defaultReward =
        selectedPeriod === "Daily"
            ? 100
            : selectedPeriod === "Weekly"
            ? 500
            : 1000;

    // Quick stake amounts
    const quickStakes = [100, 500, 1000, 5000];

    const handlePredict = async () => {
        if (!selectedOutcome) {
            setError("Please select a prediction outcome");
            return;
        }

        if (!walletAddress) {
            setError("Wallet not connected");
            return;
        }

        // Note: stakeAmount is ignored as the contract doesn't use staking
        const stake = stakeValue || 0;

        let success = false;
        if (selectedPeriod === "Daily") {
            success = await predictDailyOutcome(selectedCrypto, selectedOutcome, stake);
            if (success) {
                // Invalidate prediction queries
                queryClient.invalidateQueries({ queryKey: ["linera", "player", walletAddress, "dailyOutcome"] });
            }
        } else if (selectedPeriod === "Weekly") {
            success = await predictWeeklyOutcome(selectedCrypto, selectedOutcome, stake);
            if (success) {
                queryClient.invalidateQueries({ queryKey: ["linera", "player", walletAddress, "weeklyOutcome"] });
            }
        } else {
            success = await predictMonthlyOutcome(selectedCrypto, selectedOutcome, stake);
            if (success) {
                queryClient.invalidateQueries({ queryKey: ["linera", "player", walletAddress, "monthlyOutcome"] });
            }
        }

        if (success) {
            // Reset form on success
            setStakeAmount("");
            setSelectedOutcome(null);
            setShowModal(false);
            setError(null);
        }
        // Error is set by store action if it fails
    };

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    const formatPrice = (price: number) => {
        if (price >= 1000) {
            return `$${price.toLocaleString(undefined, {
                maximumFractionDigits: 0,
            })}`;
        }
        return `$${price.toLocaleString(undefined, {
            maximumFractionDigits: 2,
        })}`;
    };

    const cryptocurrencies: Cryptocurrency[] = [
        "BTC",
        "ETH",
        "SOL",
        "BNB",
        "ADA",
        "DOT",
    ];

    return (
        <>
            {/* Main Prediction Section - Very Prominent */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-brutal border-4 border-primary bg-black relative overflow-hidden"
            >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 opacity-10">
                    <motion.div
                        className="absolute top-0 right-0 w-64 h-64 bg-primary"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="w-16 h-16 bg-primary border-4 border-primary flex items-center justify-center"
                            >
                                <Target className="text-black" size={32} />
                            </motion.div>
                            <div>
                                <h2 className="text-3xl font-brutal text-primary mb-1">
                                    PRICE PREDICTIONS
                                </h2>
                                <p className="text-sm font-mono-brutal text-white">
                                    Predict crypto prices • Earn up to 5x
                                    rewards
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowModal(true)}
                            className="btn-brutal text-lg px-8 py-4 flex items-center gap-2"
                            disabled={hasActivePrediction}
                        >
                            <Zap size={20} />
                            {hasActivePrediction
                                ? "ACTIVE PREDICTION"
                                : "MAKE PREDICTION"}
                            <ArrowRight size={20} />
                        </motion.button>
                    </div>

                    {/* Cryptocurrency Price Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {cryptocurrencies.map((crypto) => {
                            const cryptoData = cryptocurrencyPrices[crypto];
                            const isSelected = selectedCrypto === crypto;
                            const hasPrediction = activePredictions.some(
                                (p) =>
                                    p.cryptocurrency === crypto && !p.resolved
                            );

                            return (
                                <motion.button
                                    key={crypto}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCrypto(crypto)}
                                    className={`p-4 border-2 text-left transition-none ${
                                        isSelected
                                            ? "bg-primary text-black border-primary"
                                            : "bg-black text-white border-white hover:border-primary"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-brutal">
                                                {cryptoData.logo}
                                            </span>
                                            <div>
                                                <p className="font-brutal text-sm">
                                                    {crypto}
                                                </p>
                                                <p className="text-xs font-mono-brutal opacity-70">
                                                    {cryptoData.name}
                                                </p>
                                            </div>
                                        </div>
                                        {hasPrediction && (
                                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-brutal">
                                            {formatPrice(cryptoData.price)}
                                        </p>
                                        <div
                                            className={`flex items-center gap-1 text-xs font-brutal ${
                                                cryptoData.change24h >= 0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {cryptoData.change24h >= 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}
                                            {Math.abs(
                                                cryptoData.change24h
                                            ).toFixed(2)}
                                            %
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Active Predictions Display */}
                    {activePredictions.length > 0 && (
                        <div className="bg-black border-2 border-primary p-4">
                            <h3 className="text-sm font-brutal text-primary mb-3 flex items-center gap-2">
                                <Coins size={16} />
                                YOUR ACTIVE PREDICTIONS
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {activePredictions.map((prediction, index) => {
                                    const cryptoData =
                                        cryptocurrencyPrices[
                                            prediction.cryptocurrency
                                        ];
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-card border p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 border-2 flex items-center justify-center ${
                                                        prediction.outcome ===
                                                        "Rise"
                                                            ? "bg-success/20 border-success"
                                                            : prediction.outcome ===
                                                              "Fall"
                                                            ? "bg-danger/20 border-danger"
                                                            : "bg-gray-600 border-gray-400"
                                                    }`}
                                                >
                                                    {prediction.outcome ===
                                                    "Rise" ? (
                                                        <TrendingUp
                                                            className="text-success"
                                                            size={20}
                                                        />
                                                    ) : prediction.outcome ===
                                                      "Fall" ? (
                                                        <TrendingDown
                                                            className="text-danger"
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <Minus
                                                            className="text-gray-400"
                                                            size={20}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-brutal text-primary text-sm">
                                                        {
                                                            prediction.cryptocurrency
                                                        }{" "}
                                                        - {prediction.period}
                                                    </p>
                                                    <p className="text-xs font-mono-brutal text-white">
                                                        {prediction.outcome} •{" "}
                                                        {formatPrice(
                                                            cryptoData.price
                                                        )}
                                                    </p>
                                                    {prediction.stakedAmount >
                                                        0 && (
                                                        <p className="text-xs font-mono-brutal text-accent">
                                                            Staked:{" "}
                                                            {formatPoints(
                                                                prediction.stakedAmount
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-brutal text-accent">
                                                    {formatPoints(
                                                        prediction.potentialReward
                                                    )}
                                                </p>
                                                <p className="text-xs font-mono-brutal text-text-body">
                                                    Potential
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Info Banner */}
                    <div className="mt-6 bg-primary/20 border border-primary p-4">
                        <div className="flex items-start gap-3">
                            <Zap className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm font-brutal text-primary mb-1">
                                    HOW TO EARN POINTS
                                </p>
                                <ul className="text-xs font-mono-brutal text-white space-y-1">
                                    <li>
                                        • Predict price direction
                                        (Rise/Fall/Neutral) for any crypto
                                    </li>
                                    <li>
                                        • Stake points for higher rewards (2x-5x
                                        multiplier)
                                    </li>
                                    <li>
                                        • Free predictions available (earn
                                        100-1000 points if correct)
                                    </li>
                                    <li>
                                        • Correct predictions earn rewards when
                                        period ends
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Prediction Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowModal(false);
                            setError(null);
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="card-brutal w-[1/2] border-4 border-primary"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-brutal text-primary">
                                    MAKE PREDICTION
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setError(null);
                                    }}
                                    className="w-10 h-10 border-2 border-white bg-black text-white hover:bg-primary hover:text-black transition-none flex items-center justify-center text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-danger/20 border-2 border-danger p-4 mb-6"
                                >
                                    <p className="text-sm font-mono-brutal text-danger">
                                        {error}
                                    </p>
                                </motion.div>
                            )}

                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div>
                                    {/* Cryptocurrency Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-brutal text-white mb-3">
                                            SELECT CRYPTOCURRENCY
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {cryptocurrencies.map((crypto) => {
                                                const cryptoData =
                                                    cryptocurrencyPrices[
                                                        crypto
                                                    ];
                                                const isSelected =
                                                    selectedCrypto === crypto;
                                                return (
                                                    <button
                                                        key={crypto}
                                                        onClick={() =>
                                                            setSelectedCrypto(
                                                                crypto
                                                            )
                                                        }
                                                        className={`py-3 px-2 border-2 font-brutal transition-none text-center ${
                                                            isSelected
                                                                ? "bg-primary text-black border-primary"
                                                                : "bg-black text-white border-white hover:bg-white hover:text-black"
                                                        }`}
                                                    >
                                                        <div className="text-xl mb-1">
                                                            {cryptoData.logo}
                                                        </div>
                                                        <p className="text-xs">
                                                            {crypto}
                                                        </p>
                                                        <p className="text-xs opacity-70">
                                                            {formatPrice(
                                                                cryptoData.price
                                                            )}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Period Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-brutal text-white mb-3">
                                            SELECT PERIOD
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(
                                                [
                                                    "Daily",
                                                    "Weekly",
                                                    "Monthly",
                                                ] as const
                                            ).map((period) => {
                                                const multiplier =
                                                    getRewardMultiplier(period);
                                                const hasActive =
                                                    activePredictions.some(
                                                        (p) =>
                                                            p.period ===
                                                                period &&
                                                            p.cryptocurrency ===
                                                                selectedCrypto
                                                    );

                                                return (
                                                    <button
                                                        key={period}
                                                        onClick={() =>
                                                            setSelectedPeriod(
                                                                period
                                                            )
                                                        }
                                                        disabled={hasActive}
                                                        className={`py-3 px-2 border-2 font-brutal transition-none text-center ${
                                                            selectedPeriod ===
                                                            period
                                                                ? "bg-primary text-black border-primary"
                                                                : hasActive
                                                                ? "bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed"
                                                                : "bg-black text-white border-white hover:bg-white hover:text-black"
                                                        }`}
                                                    >
                                                        <p className="text-sm">
                                                            {period}
                                                        </p>
                                                        <p className="text-xs mt-1">
                                                            {multiplier}x Reward
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div>
                                    {/* Outcome Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-brutal text-white mb-3">
                                            PREDICT PRICE MOVEMENT
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(
                                                [
                                                    {
                                                        value: "Rise",
                                                        icon: TrendingUp,
                                                        colorClass:
                                                            "bg-success text-black border-success",
                                                    },
                                                    {
                                                        value: "Fall",
                                                        icon: TrendingDown,
                                                        colorClass:
                                                            "bg-danger text-black border-danger",
                                                    },
                                                    {
                                                        value: "Neutral",
                                                        icon: Minus,
                                                        colorClass:
                                                            "bg-gray-600 text-white border-gray-400",
                                                    },
                                                ] as const
                                            ).map(
                                                ({
                                                    value,
                                                    icon: Icon,
                                                    colorClass,
                                                }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() =>
                                                            setSelectedOutcome(
                                                                value
                                                            )
                                                        }
                                                        className={`py-4 px-2 border-2 font-brutal transition-none flex flex-col items-center gap-2 ${
                                                            selectedOutcome ===
                                                            value
                                                                ? colorClass
                                                                : "bg-black text-white border-white hover:bg-white hover:text-black"
                                                        }`}
                                                    >
                                                        <Icon size={24} />
                                                        <span className="text-sm">
                                                            {value}
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Staking Section */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-brutal text-white mb-3">
                                            STAKE POINTS (OPTIONAL)
                                        </label>
                                        <div className="bg-black border-2 p-4 mb-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-mono-brutal text-white">
                                                    Stake Amount
                                                </span>
                                                <span className="text-xs font-mono-brutal text-text-body">
                                                    Balance:{" "}
                                                    {formatPoints(
                                                        player.tokenBalance
                                                    )}
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                value={stakeAmount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    if (
                                                        value === "" ||
                                                        /^\d+$/.test(value)
                                                    ) {
                                                        setStakeAmount(value);
                                                    }
                                                }}
                                                placeholder="0 (optional - free prediction)"
                                                min="0"
                                                max={player.tokenBalance}
                                                className="w-full bg-background border-2 border-white px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary font-mono-brutal mb-3"
                                            />

                                            {/* Quick Stake Buttons */}
                                            <div className="flex gap-2 flex-wrap">
                                                {quickStakes.map((amount) => (
                                                    <button
                                                        key={amount}
                                                        onClick={() =>
                                                            setStakeAmount(
                                                                amount <=
                                                                    player.tokenBalance
                                                                    ? amount.toString()
                                                                    : stakeAmount
                                                            )
                                                        }
                                                        disabled={
                                                            amount >
                                                            player.tokenBalance
                                                        }
                                                        className={`px-3 py-1 border-2 font-brutal text-xs transition-none ${
                                                            amount >
                                                            player.tokenBalance
                                                                ? "bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed"
                                                                : "bg-black text-white border-white hover:bg-white hover:text-black"
                                                        }`}
                                                    >
                                                        {formatPoints(amount)}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        setStakeAmount(
                                                            player.tokenBalance.toString()
                                                        )
                                                    }
                                                    className="px-3 py-1 border-2 font-brutal text-xs bg-black text-white border-white hover:bg-white hover:text-black transition-none"
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reward Preview */}
                                        <div className="bg-primary/20 border-2 border-primary p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-mono-brutal text-white">
                                                    Potential Reward
                                                </span>
                                                <span className="text-xl font-brutal text-primary">
                                                    {stakeValue > 0
                                                        ? formatPoints(
                                                              potentialReward
                                                          )
                                                        : formatPoints(
                                                              defaultReward
                                                          )}
                                                </span>
                                            </div>
                                            {stakeValue > 0 ? (
                                                <p className="text-xs font-mono-brutal text-white">
                                                    Stake{" "}
                                                    {formatPoints(stakeValue)} ×{" "}
                                                    {rewardMultiplier}x ={" "}
                                                    {formatPoints(
                                                        potentialReward
                                                    )}{" "}
                                                    if correct
                                                </p>
                                            ) : (
                                                <p className="text-xs font-mono-brutal text-white">
                                                    Free prediction:{" "}
                                                    {formatPoints(
                                                        defaultReward
                                                    )}{" "}
                                                    if correct
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handlePredict}
                                disabled={
                                    !selectedOutcome ||
                                    activePredictions.some(
                                        (p) =>
                                            p.period === selectedPeriod &&
                                            p.cryptocurrency === selectedCrypto
                                    ) ||
                                    (stakeValue > 0 &&
                                        stakeValue > player.tokenBalance)
                                }
                                className="w-full btn-brutal py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {stakeValue > 0
                                    ? `STAKE ${formatPoints(
                                          stakeValue
                                      )} & PREDICT ${selectedCrypto}`
                                    : `MAKE FREE PREDICTION FOR ${selectedCrypto}`}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
