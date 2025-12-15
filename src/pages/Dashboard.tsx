import { useGameStore, getXPForNextLevel } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuTrendingUp as TrendingUp,
    LuTrendingDown as TrendingDown,
    LuStar as Star,
    LuTrophy as Trophy,
    LuArrowRight as ArrowRight,
    LuGift as Gift,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import logo from "@/assets/roxy-logo.png";
import { useState, useEffect, useRef } from "react";
import { PricePrediction } from "@/components/PricePrediction";

export function Dashboard() {
    const {
        player,
        currentMarketPrice,
        claimDailyReward,
        achievements,
    } = useGameStore();

    const [priceChange, setPriceChange] = useState<number>(0);
    const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
    const prevPriceRef = useRef(currentMarketPrice.price);

    // Calculate total profit
    const totalProfit = player.totalEarned - player.totalSpent;

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

    // Check if daily reward can be claimed (24-hour cooldown)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastLogin = player.lastLogin || 0;
    const timeSinceLastLogin = Date.now() - lastLogin;
    const canClaimDailyReward = timeSinceLastLogin >= oneDayMs || lastLogin === 0;

    // Track price changes for live updates
    useEffect(() => {
        const prevPrice = prevPriceRef.current;
        const currentPrice = currentMarketPrice.price;
        const change = currentPrice - prevPrice;
        const changePercent = (change / prevPrice) * 100;

        setPriceChange(change);
        setPriceChangePercent(changePercent);
        prevPriceRef.current = currentPrice;

        // Reset animation after 2 seconds
        const timer = setTimeout(() => {
            setPriceChange(0);
            setPriceChangePercent(0);
        }, 2000);

        return () => clearTimeout(timer);
    }, [currentMarketPrice.price]);


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
                    data-tutorial="total-profit"
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
                    data-tutorial="experience"
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
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-3xl font-brutal text-primary">
                                {currentMarketPrice.price.toLocaleString()} PTS
                            </p>
                            <AnimatePresence>
                                {priceChange !== 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={`flex items-center gap-1 ${
                                            priceChange > 0 ? "text-success" : "text-danger"
                                        }`}
                                    >
                                        {priceChange > 0 ? (
                                            <TrendingUp size={20} />
                                        ) : (
                                            <TrendingDown size={20} />
                                        )}
                                        <span className="text-sm font-brutal">
                                            {priceChange > 0 ? "+" : ""}
                                            {priceChangePercent.toFixed(2)}%
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                    data-tutorial="daily-reward"
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

                {/* Price Predictions - Full Section - Very Prominent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-12 mb-6"
                    data-tutorial="predictions"
                >
                    <PricePrediction />
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
                        data-tutorial="markets-button"
                    >
                        VIEW MARKETS
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </div>

        </div>
    );
}
