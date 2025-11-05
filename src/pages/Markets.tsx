import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion";
import {
    LuPlus as Plus,
    LuTrendingUp as TrendingUp,
} from "react-icons/lu";
import { BuySellModal } from "@/components/BuySellModal";

type SortOption = "all" | "active" | "newest";

export function Markets() {
    const { markets, player, createMarket } = useGameStore();
    const [sortBy, setSortBy] = useState<SortOption>("all");
    const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMarketTitle, setNewMarketTitle] = useState("");
    const [newMarketAmount, setNewMarketAmount] = useState("");
    const [newMarketFee, setNewMarketFee] = useState("");

    // Filter markets by status
    const filteredMarkets = markets.filter((market) => {
        if (sortBy === "active") return market.status === "Active";
        if (sortBy === "newest")
            return market.creationTime > Date.now() - 7 * 24 * 60 * 60 * 1000;
        return true;
    });

    // Check if player can create market (Level 5+ and 10,000+ points)
    const canCreateMarket = player.level >= 5 && player.tokenBalance >= 10000;

    const handleCreateMarket = () => {
        const amount = parseFloat(newMarketAmount);
        const feePercent = parseFloat(newMarketFee);

        if (
            !newMarketTitle.trim() ||
            isNaN(amount) ||
            amount <= 0 ||
            isNaN(feePercent) ||
            feePercent < 0 ||
            feePercent > 100
        ) {
            return;
        }

        if (!canCreateMarket) {
            return;
        }

        createMarket(newMarketTitle, amount, feePercent);
        setShowCreateModal(false);
        setNewMarketTitle("");
        setNewMarketAmount("");
        setNewMarketFee("");
    };

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    const formatFee = (fee: number) => {
        return `${fee}%`;
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 lg:pb-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-brutal text-primary mb-2">
                            POINT TRADING MARKETS
                        </h1>
                        <p className="font-mono-brutal text-white">
                            BUY AND SELL POINTS WITH OTHER PLAYERS
                        </p>
                    </div>
                    {canCreateMarket && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 btn-brutal"
                        >
                            <Plus size={16} />
                            CREATE MARKET
                        </button>
                    )}
                </div>

                {/* Requirements Info */}
                {!canCreateMarket && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-brutal mb-6 border-accent"
                    >
                        <p className="font-mono-brutal text-white">
                            <span className="text-accent font-brutal">
                                MARKET CREATION REQUIREMENTS:
                            </span>{" "}
                            Level 5+ and 10,000+ points required. You are currently Level{" "}
                            {player.level} with {formatPoints(player.tokenBalance)}.
                        </p>
                    </motion.div>
                )}

                {/* Sort Options */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: "all", label: "ALL MARKETS" },
                        { key: "active", label: "ACTIVE" },
                        { key: "newest", label: "NEWEST" },
                    ].map((option) => (
                        <button
                            key={option.key}
                            onClick={() => setSortBy(option.key as SortOption)}
                            className={`px-4 py-2 border-brutal font-brutal transition-none ${
                                sortBy === option.key
                                    ? "bg-primary text-black"
                                    : "bg-black text-white hover:bg-white hover:text-black"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Market Cards */}
                {filteredMarkets.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredMarkets.map((market, index) => {
                            const liquidityPercent =
                                (market.totalLiquidity / market.amount) * 100;
                            const playerPosition = market.positions[player.id] || 0;

                            return (
                                <motion.div
                                    key={market.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`card-brutal cursor-pointer transition-none ${
                                        selectedMarket === market.id
                                            ? "border-accent border-2"
                                            : "border hover:border-primary"
                                    }`}
                                    onClick={() => setSelectedMarket(market.id)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-brutal text-primary mb-1">
                                                {market.title}
                                            </h3>
                                            <p className="text-xs font-mono-brutal text-white">
                                                Creator: {market.creator.slice(0, 8)}...
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xs font-brutal px-2 py-1 border ${
                                                    market.status === "Active"
                                                        ? "bg-success/20 border-success text-success"
                                                        : "bg-gray-600 border-gray-600 text-gray-400"
                                                }`}
                                            >
                                                {market.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-mono-brutal text-white">
                                                TOTAL LIQUIDITY
                                            </span>
                                            <span className="font-brutal text-primary">
                                                {formatPoints(market.totalLiquidity)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-mono-brutal text-white">
                                                FEE PERCENTAGE
                                            </span>
                                            <span className="font-brutal text-accent">
                                                {formatFee(market.feePercent)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-mono-brutal text-white">
                                                PARTICIPANTS
                                            </span>
                                            <span className="font-brutal text-white">
                                                {market.totalParticipants}
                                            </span>
                                        </div>

                                        {/* Liquidity Bar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-mono-brutal text-white">
                                                    LIQUIDITY
                                                </span>
                                                <span className="text-xs font-mono-brutal text-white">
                                                    {liquidityPercent.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-black border h-2">
                                                <div
                                                    className="bg-primary h-full border border-primary"
                                                    style={{
                                                        width: `${liquidityPercent}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {playerPosition > 0 && (
                                            <div className="bg-primary/20 border border-primary p-2">
                                                <p className="text-xs font-mono-brutal text-white">
                                                    YOUR POSITION
                                                </p>
                                                <p className="font-brutal text-primary">
                                                    {formatPoints(playerPosition)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMarket(market.id);
                                            }}
                                            className="flex-1 btn-brutal"
                                            disabled={market.status !== "Active"}
                                        >
                                            BUY POINTS
                                        </button>
                                        {player.level >= 5 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMarket(market.id);
                                                }}
                                                className="flex-1 btn-danger font-brutal py-2 px-4"
                                                disabled={
                                                    market.status !== "Active" ||
                                                    playerPosition === 0
                                                }
                                            >
                                                SELL POINTS
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card-brutal text-center py-12">
                        <TrendingUp size={48} className="mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-brutal mb-2 text-primary">
                            NO MARKETS FOUND
                        </h3>
                        <p className="font-mono-brutal text-white">
                            {canCreateMarket
                                ? "CREATE THE FIRST MARKET TO GET STARTED"
                                : "MARKETS WILL APPEAR HERE WHEN CREATED"}
                        </p>
                    </div>
                )}

                {/* Buy/Sell Modal */}
                {selectedMarket && (
                    <BuySellModal
                        market={markets.find((m) => m.id === selectedMarket)!}
                        onClose={() => setSelectedMarket(null)}
                    />
                )}

                {/* Create Market Modal */}
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
                                CREATE NEW MARKET
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-brutal text-white mb-2">
                                        MARKET TITLE
                                    </label>
                                    <input
                                        type="text"
                                        value={newMarketTitle}
                                        onChange={(e) =>
                                            setNewMarketTitle(e.target.value)
                                        }
                                        placeholder="ENTER MARKET TITLE"
                                        className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-brutal text-white mb-2">
                                        AMOUNT (POINTS)
                                    </label>
                                    <input
                                        type="number"
                                        value={newMarketAmount}
                                        onChange={(e) =>
                                            setNewMarketAmount(e.target.value)
                                        }
                                        placeholder="10000"
                                        min="1000"
                                        step="100"
                                        className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                                    />
                                    <p className="text-xs font-mono-brutal text-white mt-1">
                                        Minimum: 1,000 points. Creation cost: 100 points.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-brutal text-white mb-2">
                                        FEE PERCENTAGE (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        value={newMarketFee}
                                        onChange={(e) =>
                                            setNewMarketFee(e.target.value)
                                        }
                                        placeholder="10"
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                                    />
                                    <p className="text-xs font-mono-brutal text-white mt-1">
                                        You receive 98% of fees, platform gets 2%.
                                    </p>
                                </div>

                                <div className="bg-black border p-3">
                                    <p className="text-xs font-mono-brutal text-white mb-2">
                                        TOTAL COST:
                                    </p>
                                    <p className="font-brutal text-primary">
                                        {formatPoints(
                                            (parseFloat(newMarketAmount) || 0) + 100
                                        )}
                                    </p>
                                    <p className="text-xs font-mono-brutal text-white mt-2">
                                        Your balance: {formatPoints(player.tokenBalance)}
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
                                    onClick={handleCreateMarket}
                                    disabled={
                                        !canCreateMarket ||
                                        !newMarketTitle.trim() ||
                                        !newMarketAmount ||
                                        parseFloat(newMarketAmount) < 1000 ||
                                        parseFloat(newMarketAmount) + 100 >
                                            player.tokenBalance
                                    }
                                    className="flex-1 py-3 px-4 btn-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CREATE MARKET
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
