import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion";
import {
    LuTrophy as Trophy,
    LuCrown as Crown,
    LuStar as Star,
    LuUsers as Users,
} from "react-icons/lu";

export function Leaderboard() {
    const { globalLeaderboard, guildLeaderboard } = useGameStore();
    const [activeTab, setActiveTab] = useState<"global" | "guild">("global");
    const [timeLeft, setTimeLeft] = useState("");

    // Calculate time until next reset (Sunday 23:59)
    useEffect(() => {
        const updateTimeLeft = () => {
            const now = new Date();
            const nextSunday = new Date();

            // Find next Sunday
            const daysUntilSunday = (7 - now.getDay()) % 7;
            if (
                daysUntilSunday === 0 &&
                now.getHours() >= 23 &&
                now.getMinutes() >= 59
            ) {
                nextSunday.setDate(now.getDate() + 7);
            } else if (daysUntilSunday === 0) {
                nextSunday.setDate(now.getDate());
            } else {
                nextSunday.setDate(now.getDate() + daysUntilSunday);
            }

            nextSunday.setHours(23, 59, 0, 0);

            const diff = nextSunday.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const currentLeaderboard =
        activeTab === "global" ? globalLeaderboard : [];

    const guildLeaderboardData =
        activeTab === "guild" ? guildLeaderboard : [];

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="text-accent" size={20} />;
            case 2:
                return <Trophy className="text-gray-300" size={20} />;
            case 3:
                return <Trophy className="text-success" size={20} />;
            default:
                return <span className="font-brutal">#{rank}</span>;
        }
    };

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    const formatWinRate = (rate: number) => {
        return `${rate.toFixed(1)}%`;
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 lg:pb-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-brutal text-primary mb-2">
                        LEADERBOARD
                    </h1>
                    <p className="font-mono-brutal text-white">
                        TOP TRADERS BY TOTAL PROFIT
                    </p>
                </div>

                {/* Reset Timer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-brutal-primary mb-6 border-primary"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="text-accent" size={20} />
                            <span className="font-brutal text-text">
                                NEXT RESET
                            </span>
                        </div>
                        <span className="text-lg font-brutal text-text">
                            {timeLeft}
                        </span>
                    </div>
                    <p className="text-sm font-mono-brutal text-text mt-1">
                        SUNDAY 23:59
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("global")}
                        className={`px-4 py-2 border-brutal font-brutal transition-none ${
                            activeTab === "global"
                                ? "bg-primary text-black"
                                : "bg-black text-white hover:bg-white hover:text-black"
                        }`}
                    >
                        GLOBAL
                    </button>
                    <button
                        onClick={() => setActiveTab("guild")}
                        className={`px-4 py-2 border-brutal font-brutal transition-none ${
                            activeTab === "guild"
                                ? "bg-primary text-black"
                                : "bg-black text-white hover:bg-white hover:text-black"
                        }`}
                    >
                        GUILD
                    </button>
                </div>

                {/* Global Leaderboard */}
                {activeTab === "global" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-brutal overflow-hidden"
                    >
                        {currentLeaderboard.length > 0 ? (
                            <div className="divide-y divide-white">
                                {currentLeaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.playerId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 flex items-center gap-4 border ${
                                            entry.isCurrentUser
                                                ? "bg-card border-accent border-2"
                                                : "bg-card border hover:border-primary"
                                        }`}
                                    >
                                        {/* Rank */}
                                        <div className="shrink-0 w-8 text-center">
                                            {getRankIcon(entry.rank)}
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-card border-2 border-primary flex items-center justify-center">
                                                <span className="font-brutal text-primary">
                                                    {entry.displayName[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-brutal flex items-center gap-2">
                                                    {entry.displayName}
                                                    {entry.isCurrentUser && (
                                                        <span className="text-xs bg-accent text-background px-2 py-1 font-brutal">
                                                            YOU
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm font-mono-brutal">
                                                    Level {entry.level} • Win Rate:{" "}
                                                    {formatWinRate(entry.winRate)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Earned (as per contract ranking) */}
                                        <div className="text-right">
                                            <p className="font-brutal text-lg text-primary">
                                                {formatPoints(entry.totalProfit)}
                                            </p>
                                            <p className="text-xs font-mono-brutal text-white">
                                                TOTAL EARNED
                                            </p>
                                            <p className="text-xs font-mono-brutal text-white mt-1">
                                                (Ranked by total earned)
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white">
                                <Trophy size={48} className="mx-auto mb-4" />
                                <h3 className="text-lg font-brutal mb-2 text-primary">
                                    NO DATA AVAILABLE
                                </h3>
                                <p className="font-mono-brutal">
                                    LEADERBOARD DATA WILL APPEAR HERE
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Guild Leaderboard */}
                {activeTab === "guild" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-brutal overflow-hidden"
                    >
                        {guildLeaderboardData.length > 0 ? (
                            <div className="divide-y divide-white">
                                {guildLeaderboardData.map((entry, index) => (
                                    <motion.div
                                        key={entry.guildId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 flex items-center gap-4 border bg-card border hover:border-primary"
                                    >
                                        {/* Rank */}
                                        <div className="shrink-0 w-8 text-center">
                                            {getRankIcon(entry.rank)}
                                        </div>

                                        {/* Guild Info */}
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-primary border-2 border-primary flex items-center justify-center">
                                                <Users className="text-black" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-brutal text-primary">
                                                    {entry.name}
                                                </h3>
                                                <p className="text-sm font-mono-brutal text-white">
                                                    {entry.memberCount} MEMBERS
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Guild Profit */}
                                        <div className="text-right">
                                            <p className="font-brutal text-lg text-primary">
                                                {formatPoints(entry.totalGuildProfit)}
                                            </p>
                                            <p className="text-xs font-mono-brutal text-white">
                                                GUILD PROFIT
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white">
                                <Users size={48} className="mx-auto mb-4" />
                                <h3 className="text-lg font-brutal mb-2 text-primary">
                                    NO GUILD DATA
                                </h3>
                                <p className="font-mono-brutal">
                                    JOIN A GUILD TO SEE THE GUILD LEADERBOARD
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 grid grid-cols-2 gap-4"
                >
                    <div className="card-brutal">
                        <h4 className="text-sm font-mono-brutal text-white mb-1">
                            YOUR RANK
                        </h4>
                        <p className="text-2xl font-brutal text-primary">
                            #
                            {globalLeaderboard.findIndex(
                                (e) => e.isCurrentUser
                            ) + 1 || "?"}
                        </p>
                    </div>

                    <div className="card-brutal">
                        <h4 className="text-sm font-mono-brutal text-white mb-1">
                            TOTAL TRADERS
                        </h4>
                        <p className="text-2xl font-brutal text-primary">
                            {globalLeaderboard.length}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
