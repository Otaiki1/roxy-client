import { useGameStore, getXPForNextLevel } from "@/store/gameStore";
import { motion } from "framer-motion";
import {
    LuTrendingUp as TrendingUp,
    LuTrendingDown as TrendingDown,
    LuStar as Star,
    LuTrophy as Trophy,
    LuArrowRight as ArrowRight,
    LuGift as Gift,
    LuCalendar as Calendar,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import logo from "@/assets/roxy-logo.png";
import { useState } from "react";

export function Dashboard() {
    const {
        player,
        predictions,
        currentMarketPrice,
        predictDailyOutcome,
        predictWeeklyOutcome,
        predictMonthlyOutcome,
        claimDailyReward,
        achievements,
    } = useGameStore();

    // Calculate total profit
    const totalProfit = player.totalEarned - player.totalSpent;
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [predictionPeriod, setPredictionPeriod] = useState<
        "Daily" | "Weekly" | "Monthly"
    >("Daily");

    // Calculate XP progress for current level
    const xpForNextLevel = getXPForNextLevel(player.experiencePoints);
    const levelXPThreshold = 1000 * Math.pow(4, player.level - 1);
    const xpProgress =
        player.level > 1
            ? ((player.experiencePoints % levelXPThreshold) / levelXPThreshold) * 100
            : (player.experiencePoints / 1000) * 100;

    // Get recent achievements
    const recentAchievements = player.achievementsEarned
        .slice(-3)
        .map((id) => achievements.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => a !== undefined);

    // Get active predictions
    const activePredictions = predictions.filter((p) => !p.resolved);

    // Check if daily reward can be claimed (24-hour cooldown)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastLogin = player.lastLogin || 0;
    const timeSinceLastLogin = Date.now() - lastLogin;
    const canClaimDailyReward = timeSinceLastLogin >= oneDayMs || lastLogin === 0;

    const handlePredict = (outcome: "Rise" | "Fall" | "Neutral") => {
        if (predictionPeriod === "Daily") {
            predictDailyOutcome(outcome);
        } else if (predictionPeriod === "Weekly") {
            predictWeeklyOutcome(outcome);
        } else {
            predictMonthlyOutcome(outcome);
        }
        setShowPredictionModal(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 lg:pb-4">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto border-b-2 border-accent pb-4">
                <div className="flex items-center gap-4">
                    <img
                        src={logo}
                        alt="Roxy Logo"
                        className="w-16 h-16 object-contain"
                    />
                    <div>
                        <h1 className="text-xl font-brutal text-text">
                            {player.displayName}
                        </h1>
                        <p className="text-sm font-mono-brutal text-text-body">
                            LEVEL {player.level} • {player.experiencePoints.toLocaleString()} XP
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-brutal text-primary">
                        {player.tokenBalance.toLocaleString()} PTS
                    </p>
                    <p className="text-sm font-mono-brutal text-text-body">
                        POINT BALANCE
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto space-y-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                {/* Total Profit Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-brutal lg:col-span-8 border"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-brutal text-primary mb-2">
                            {totalProfit >= 0 ? "+" : ""}
                            {totalProfit.toLocaleString()} PTS
                        </h2>
                        <p className="font-mono-brutal text-white mb-4">
                            TOTAL PROFIT
                        </p>

                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            {totalProfit >= 0 ? (
                                <TrendingUp className="text-success" size={20} />
                            ) : (
                                <TrendingDown className="text-danger" size={20} />
                            )}
                            <span
                                className={`text-lg font-brutal ${
                                    totalProfit >= 0 ? "text-success" : "text-danger"
                                }`}
                            >
                                {totalProfit >= 0 ? "+" : ""}
                                {totalProfit.toLocaleString()} POINTS
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-mono-brutal text-white">
                                    EARNED
                                </p>
                                <p className="font-brutal text-primary">
                                    {player.totalEarned.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="font-mono-brutal text-white">
                                    SPENT
                                </p>
                                <p className="font-brutal text-accent">
                                    {player.totalSpent.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="font-mono-brutal text-white">
                                    REPUTATION
                                </p>
                                <p className="font-brutal text-primary">
                                    {player.reputation}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* XP Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-brutal lg:col-span-4 border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-brutal text-primary">
                            EXPERIENCE
                        </h3>
                        <span className="text-sm font-mono-brutal text-white">
                            {player.experiencePoints.toLocaleString()} XP
                        </span>
                    </div>

                    <div className="w-full bg-black border h-6">
                        <motion.div
                            className="bg-accent h-full border border-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>

                    <p className="text-sm font-mono-brutal text-white mt-2">
                        {xpForNextLevel.toLocaleString()} XP TO NEXT LEVEL
                    </p>
                </motion.div>

                {/* Current Market Price */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card-brutal lg:col-span-6 border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-brutal text-primary">
                            CURRENT PRICE
                        </h3>
                        <span className="text-xs font-mono-brutal text-white">
                            BTC
                        </span>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-brutal text-primary">
                            {currentMarketPrice.price.toLocaleString()} PTS
                        </p>
                        <p className="text-sm font-mono-brutal text-white mt-2">
                            Last updated: {new Date(currentMarketPrice.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </motion.div>

                {/* Daily Reward */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-brutal lg:col-span-6 border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-brutal text-primary flex items-center gap-2">
                            <Gift className="text-primary" size={20} />
                            DAILY REWARD
                        </h3>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-mono-brutal text-white mb-3">
                            Claim 10 points every 24 hours
                        </p>
                        <button
                            onClick={claimDailyReward}
                            disabled={!canClaimDailyReward}
                            className={`btn-brutal ${
                                !canClaimDailyReward
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            CLAIM REWARD
                        </button>
                    </div>
                </motion.div>

                {/* Price Predictions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="card-brutal lg:col-span-6 border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-brutal text-primary flex items-center gap-2">
                            <Calendar className="text-primary" size={20} />
                            PRICE PREDICTIONS
                        </h3>
                        <button
                            onClick={() => setShowPredictionModal(true)}
                            className="text-accent hover:text-primary font-brutal transition-none text-sm"
                        >
                            MAKE PREDICTION
                        </button>
                    </div>

                    {activePredictions.length > 0 ? (
                        <div className="space-y-3">
                            {activePredictions.slice(0, 3).map((prediction, index) => (
                                <div
                                    key={index}
                                    className="bg-black border p-3 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-brutal text-primary">
                                            {prediction.period} Prediction
                                        </p>
                                        <p className="text-sm font-mono-brutal text-white">
                                            {prediction.outcome}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono-brutal text-white">
                                            {prediction.period === "Daily"
                                                ? "100 PTS"
                                                : prediction.period === "Weekly"
                                                ? "500 PTS"
                                                : "1000 PTS"}
                                        </p>
                                        <p className="text-xs font-mono-brutal text-text-body">
                                            Reward
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-white">
                            <Calendar size={32} className="mx-auto mb-2" />
                            <p className="font-mono-brutal text-sm">
                                NO ACTIVE PREDICTIONS
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Badges Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card-brutal lg:col-span-6 border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-brutal text-primary flex items-center gap-2">
                            <Trophy className="text-primary" size={20} />
                            RECENT ACHIEVEMENTS
                        </h3>
                        <Link
                            to="/app/leaderboard"
                            className="text-accent hover:text-primary font-brutal transition-none text-sm"
                        >
                            VIEW ALL
                        </Link>
                    </div>

                    {recentAchievements.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {recentAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-primary p-3 text-center border-2 border-primary"
                                >
                                    <div className="text-2xl mb-1 font-brutal">
                                        {achievement.icon}
                                    </div>
                                    <p className="text-xs font-brutal text-background">
                                        {achievement.name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-white">
                            <Star size={32} className="mx-auto mb-2" />
                            <p className="font-mono-brutal text-sm">
                                NO ACHIEVEMENTS YET. START PLAYING TO EARN YOUR FIRST
                                ACHIEVEMENT!
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 gap-4 lg:col-span-12"
                >
                    <div className="card-brutal border">
                        <h4 className="text-sm font-mono-brutal text-white mb-1">
                            MARKETS PARTICIPATED
                        </h4>
                        <p className="text-xl font-brutal text-primary">
                            {player.marketsParticipated}
                        </p>
                    </div>

                    <div className="card-brutal border">
                        <h4 className="text-sm font-mono-brutal text-white mb-1">
                            WIN STREAK
                        </h4>
                        <p className="text-xl font-brutal text-primary">
                            {player.winStreak}
                        </p>
                    </div>
                </motion.div>

                {/* View Markets Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 lg:col-span-12"
                >
                    <Link
                        to="/app/markets"
                        className="w-full lg:w-auto lg:inline-flex btn-brutal flex items-center justify-center gap-2"
                    >
                        VIEW MARKETS
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </div>

            {/* Prediction Modal */}
            {showPredictionModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPredictionModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="card-brutal w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-brutal text-primary mb-4">
                            MAKE PRICE PREDICTION
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-brutal text-white mb-2">
                                PERIOD
                            </label>
                            <div className="flex gap-2">
                                {(["Daily", "Weekly", "Monthly"] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setPredictionPeriod(period)}
                                        className={`flex-1 py-2 px-4 border-brutal font-brutal transition-none ${
                                            predictionPeriod === period
                                                ? "bg-primary text-black"
                                                : "bg-black text-white hover:bg-white hover:text-black"
                                        }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs font-mono-brutal text-white mt-2">
                                Reward:{" "}
                                {predictionPeriod === "Daily"
                                    ? "100 PTS"
                                    : predictionPeriod === "Weekly"
                                    ? "500 PTS"
                                    : "1000 PTS"}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-brutal text-white mb-2">
                                PREDICT OUTCOME
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["Rise", "Fall", "Neutral"] as const).map((outcome) => (
                                    <button
                                        key={outcome}
                                        onClick={() => handlePredict(outcome)}
                                        className="py-3 px-4 border-brutal font-brutal bg-black text-white hover:bg-primary hover:text-black transition-none"
                                    >
                                        {outcome}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPredictionModal(false)}
                            className="w-full py-3 px-4 bg-black text-white border-brutal font-brutal hover:bg-white hover:text-black transition-none"
                        >
                            CANCEL
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
