import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion";
import {
    LuUsers as Users,
    LuPlus as Plus,
    LuCrown as Crown,
    LuMessageCircle as MessageCircle,
    LuMapPin as MapPin,
    LuLogOut as LogOut,
    LuCoins as Coins,
} from "react-icons/lu";

export function Guilds() {
    const {
        availableGuilds,
        currentGuild,
        joinGuild,
        leaveGuild,
        createGuild,
        contributeToGuild,
        player,
    } = useGameStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGuildName, setNewGuildName] = useState("");
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [contributeAmount, setContributeAmount] = useState("");

    const handleJoinGuild = (guildId: string) => {
        joinGuild(guildId);
    };

    const handleCreateGuild = () => {
        if (newGuildName.trim()) {
            createGuild(newGuildName);
            setShowCreateModal(false);
            setNewGuildName("");
        }
    };

    const handleContribute = () => {
        const amount = parseFloat(contributeAmount);
        if (!isNaN(amount) && amount > 0 && amount <= player.tokenBalance) {
            contributeToGuild(amount);
            setShowContributeModal(false);
            setContributeAmount("");
        }
    };

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 lg:pb-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-brutal text-primary mb-2">
                        GUILDS
                    </h1>
                    <p className="font-mono-brutal text-white">
                        JOIN FORCES WITH OTHER PLAYERS AND SHARE REWARDS
                    </p>
                </div>

                {/* Current Guild */}
                {currentGuild && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-brutal-primary mb-6 border-primary"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black border flex items-center justify-center text-xl">
                                    <Crown className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-brutal text-text">
                                        {currentGuild.name}
                                    </h3>
                                    <p className="text-sm font-mono-brutal text-text-body">
                                        Founded by {currentGuild.founder.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => leaveGuild()}
                                className="flex items-center gap-2 px-4 py-2 btn-danger"
                            >
                                <LogOut size={16} />
                                LEAVE
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-black border p-3">
                                <p className="text-xs font-mono-brutal text-white mb-1">
                                    MEMBERS
                                </p>
                                <p className="text-lg font-brutal text-primary">
                                    {currentGuild.members.length}
                                </p>
                            </div>
                            <div className="bg-black border p-3">
                                <p className="text-xs font-mono-brutal text-white mb-1">
                                    GUILD LEVEL
                                </p>
                                <p className="text-lg font-brutal text-primary">
                                    {currentGuild.guildLevel}
                                </p>
                            </div>
                            <div className="bg-black border p-3">
                                <p className="text-xs font-mono-brutal text-white mb-1">
                                    TOTAL PROFIT
                                </p>
                                <p className="text-lg font-brutal text-primary">
                                    {formatPoints(currentGuild.totalGuildProfit)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/20 border border-primary p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Coins className="text-primary" size={20} />
                                    <span className="font-brutal text-primary">
                                        SHARED POOL
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowContributeModal(true)}
                                    className="text-sm px-3 py-1 btn-brutal"
                                >
                                    CONTRIBUTE
                                </button>
                            </div>
                            <p className="text-2xl font-brutal text-primary">
                                {formatPoints(currentGuild.sharedPool)}
                            </p>
                            <p className="text-xs font-mono-brutal text-white mt-1">
                                Collective fund for guild activities
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Guild Map Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-brutal mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="text-primary" size={20} />
                        <h3 className="text-lg font-brutal text-primary">
                            GUILD MAP
                        </h3>
                    </div>
                    <div className="h-32 bg-black border-brutal flex items-center justify-center text-white">
                        <div className="text-center">
                            <MapPin size={32} className="mx-auto mb-2" />
                            <p className="font-mono-brutal">
                                INTERACTIVE GUILD MAP COMING SOON
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Available Guilds */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-brutal mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-brutal text-primary">
                            AVAILABLE GUILDS
                        </h3>
                        {!currentGuild && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 btn-brutal"
                            >
                                <Plus size={16} />
                                CREATE GUILD
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {availableGuilds.map((guild, index) => {
                            const isMember = guild.members.includes(player.id);

                            return (
                                <motion.div
                                    key={guild.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-black border-brutal hover:border-primary transition-none"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-primary border-brutal flex items-center justify-center text-lg font-brutal">
                                                <Users />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-brutal text-primary">
                                                    {guild.name}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs font-mono-brutal text-white">
                                                        {guild.members.length} MEMBERS
                                                    </span>
                                                    <span className="text-xs font-mono-brutal text-white">
                                                        Level {guild.guildLevel}
                                                    </span>
                                                    <span className="text-xs font-mono-brutal text-white">
                                                        {formatPoints(
                                                            guild.totalGuildProfit
                                                        )}{" "}
                                                        PROFIT
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Coins className="text-accent" size={14} />
                                                    <span className="text-xs font-mono-brutal text-accent">
                                                        Shared Pool:{" "}
                                                        {formatPoints(guild.sharedPool)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleJoinGuild(guild.id)}
                                            disabled={isMember || !!currentGuild}
                                            className={`px-4 py-2 border-brutal font-brutal transition-none ${
                                                isMember || currentGuild
                                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                                    : "btn-brutal"
                                            }`}
                                        >
                                            {isMember ? "MEMBER" : "JOIN"}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Guild Chat Placeholder */}
                {currentGuild && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-brutal"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <MessageCircle className="text-primary" size={20} />
                            <h3 className="text-lg font-brutal text-primary">
                                GUILD CHAT
                            </h3>
                        </div>
                        <div className="h-32 bg-black border-brutal flex items-center justify-center text-white">
                            <div className="text-center">
                                <MessageCircle size={32} className="mx-auto mb-2" />
                                <p className="font-mono-brutal">
                                    GUILD CHAT COMING SOON
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Create Guild Modal */}
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="card-brutal w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-brutal text-primary mb-4">
                                CREATE NEW GUILD
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-brutal text-white mb-2">
                                        GUILD NAME
                                    </label>
                                    <input
                                        type="text"
                                        value={newGuildName}
                                        onChange={(e) =>
                                            setNewGuildName(e.target.value)
                                        }
                                        placeholder="ENTER GUILD NAME"
                                        className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                                    />
                                </div>

                                <div className="bg-black border p-3">
                                    <p className="text-xs font-mono-brutal text-white">
                                        You will become the founder of this guild. You can
                                        invite other players to join.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 px-4 bg-black text-white border-brutal font-brutal hover:bg-white hover:text-black transition-none"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleCreateGuild}
                                    disabled={!newGuildName.trim()}
                                    className="flex-1 py-3 px-4 btn-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CREATE GUILD
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Contribute Modal */}
                {showContributeModal && currentGuild && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowContributeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="card-brutal w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-brutal text-primary mb-4">
                                CONTRIBUTE TO GUILD POOL
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-brutal text-white mb-2">
                                        AMOUNT (POINTS)
                                    </label>
                                    <input
                                        type="number"
                                        value={contributeAmount}
                                        onChange={(e) =>
                                            setContributeAmount(e.target.value)
                                        }
                                        placeholder="0"
                                        min="1"
                                        max={player.tokenBalance}
                                        step="1"
                                        className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                                    />
                                </div>

                                <div className="bg-black border p-3">
                                    <p className="text-xs font-mono-brutal text-white mb-2">
                                        YOUR BALANCE:
                                    </p>
                                    <p className="font-brutal text-primary">
                                        {formatPoints(player.tokenBalance)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowContributeModal(false)}
                                    className="flex-1 py-3 px-4 bg-black text-white border-brutal font-brutal hover:bg-white hover:text-black transition-none"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleContribute}
                                    disabled={
                                        !contributeAmount ||
                                        parseFloat(contributeAmount) <= 0 ||
                                        parseFloat(contributeAmount) >
                                            player.tokenBalance
                                    }
                                    className="flex-1 py-3 px-4 btn-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CONTRIBUTE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
