import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuX as X,
    LuTrendingUp as TrendingUp,
    LuTrendingDown as TrendingDown,
} from "react-icons/lu";
import { useGameStore } from "@/store/gameStore";
import type { Market } from "@/store/gameStore";

interface BuySellModalProps {
    market: Market;
    onClose: () => void;
}

export function BuySellModal({ market, onClose }: BuySellModalProps) {
    const [isBuying, setIsBuying] = useState(true);
    const [desiredPoints, setDesiredPoints] = useState("");
    const { player, buyShares, sellShares } = useGameStore();

    const numDesiredPoints = parseFloat(desiredPoints) || 0;

    // Calculate payment using progressive exchange rate: pay 10% of desired amount + fee
    const basePayment = numDesiredPoints / 10;
    const fee = (basePayment * market.feePercent) / 100;
    const totalPayment = basePayment + fee;

    const canAfford = totalPayment <= player.tokenBalance;
    const hasEnoughLiquidity = numDesiredPoints <= market.totalLiquidity;

    // For selling, check player's position
    const playerPosition = market.positions[player.id] || 0;
    const canSell = playerPosition > 0 && numDesiredPoints <= playerPosition;

    const handleConfirm = () => {
        if (numDesiredPoints <= 0) return;

        if (isBuying) {
            if (canAfford && hasEnoughLiquidity && market.status === "Active") {
                buyShares(market.id, numDesiredPoints);
                onClose();
            }
        } else {
            // For selling, check if player is Level 5+
            if (player.level < 5) {
                return;
            }
            if (canSell && market.status === "Active") {
                sellShares(market.id, numDesiredPoints);
                onClose();
            }
        }
    };

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-9999 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-card border-2 border-primary w-full max-w-md p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-brutal text-primary text-lg">
                                {market.title}
                            </h3>
                            <p className="text-sm font-mono-brutal text-white">
                                {market.status} • Fee: {market.feePercent}%
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-accent transition-none font-brutal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Buy/Sell Toggle */}
                    <div className="flex bg-black border-brutal p-1 mb-6">
                        <button
                            onClick={() => setIsBuying(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 border-brutal font-brutal transition-none ${
                                isBuying
                                    ? "bg-primary text-black"
                                    : "bg-black text-white hover:bg-white hover:text-black"
                            }`}
                        >
                            <TrendingUp size={16} />
                            BUY POINTS
                        </button>
                        {player.level >= 5 && (
                            <button
                                onClick={() => setIsBuying(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 border-brutal font-brutal transition-none ${
                                    !isBuying
                                        ? "btn-danger"
                                        : "bg-black text-white hover:bg-white hover:text-black"
                                }`}
                            >
                                <TrendingDown size={16} />
                                SELL POINTS
                            </button>
                        )}
                    </div>

                    {/* Market Info */}
                    <div className="bg-black border p-4 mb-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-mono-brutal text-white">
                                    AVAILABLE LIQUIDITY
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
                                    {market.feePercent}%
                                </span>
                            </div>
                            {!isBuying && playerPosition > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-mono-brutal text-white">
                                        YOUR POSITION
                                    </span>
                                    <span className="font-brutal text-primary">
                                        {formatPoints(playerPosition)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exchange Rate Info */}
                    <div className="bg-primary/20 border border-primary p-3 mb-6">
                        <p className="text-xs font-mono-brutal text-white mb-1">
                            EXCHANGE RATE: 10:1
                        </p>
                        <p className="text-xs font-mono-brutal text-white">
                            Pay 10% of desired amount + fee
                        </p>
                    </div>

                    {/* Desired Points Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-brutal mb-2 text-white">
                            DESIRED POINTS
                        </label>
                        <input
                            type="number"
                            value={desiredPoints}
                            onChange={(e) => setDesiredPoints(e.target.value)}
                            placeholder="0"
                            className="w-full bg-black border-brutal px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono-brutal"
                            step="1"
                            min="1"
                            max={
                                isBuying
                                    ? market.totalLiquidity
                                    : playerPosition || 0
                            }
                        />
                    </div>

                    {/* Payment Calculation */}
                    {numDesiredPoints > 0 && (
                        <div className="bg-card border border-primary mb-6 p-4">
                            {isBuying ? (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono-brutal text-white">
                                            BASE PAYMENT (10%)
                                        </span>
                                        <span className="font-brutal text-primary">
                                            {formatPoints(basePayment)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono-brutal text-white">
                                            FEE ({market.feePercent}%)
                                        </span>
                                        <span className="font-brutal text-accent">
                                            {formatPoints(fee)}
                                        </span>
                                    </div>
                                    <div className="border-t border-primary pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-brutal text-white">
                                                TOTAL PAYMENT
                                            </span>
                                            <span className="font-brutal text-primary text-lg">
                                                {formatPoints(totalPayment)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-mono-brutal text-white">
                                            YOUR BALANCE
                                        </span>
                                        <span className="font-brutal text-white">
                                            {formatPoints(player.tokenBalance)}
                                        </span>
                                    </div>
                                    {!canAfford && (
                                        <p className="text-danger text-sm mt-2 font-brutal">
                                            INSUFFICIENT BALANCE
                                        </p>
                                    )}
                                    {!hasEnoughLiquidity && (
                                        <p className="text-danger text-sm mt-2 font-brutal">
                                            INSUFFICIENT MARKET LIQUIDITY
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="bg-danger/20 border border-danger p-3 mb-2">
                                        <p className="text-xs font-mono-brutal text-white mb-1">
                                            SELLING POINTS
                                        </p>
                                        <p className="font-brutal text-danger">
                                            {formatPoints(numDesiredPoints)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono-brutal text-white">
                                            POINTS TO BURN
                                        </span>
                                        <span className="font-brutal text-danger">
                                            {formatPoints(numDesiredPoints)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-mono-brutal text-white">
                                            FEE ({market.feePercent}%)
                                        </span>
                                        <span className="font-brutal text-accent">
                                            {formatPoints((numDesiredPoints * market.feePercent) / 100)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-mono-brutal text-white">
                                            LIQUIDITY ADDED TO MARKET
                                        </span>
                                        <span className="font-brutal text-primary">
                                            {formatPoints(numDesiredPoints - (numDesiredPoints * market.feePercent) / 100)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono-brutal text-white mt-3 p-2 bg-black border">
                                        Note: Points are burned (no payment received). Fee goes to market creator and platform.
                                    </p>
                                    {!canSell && (
                                        <p className="text-danger text-sm mt-2 font-brutal">
                                            INSUFFICIENT POSITION
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-black text-white border-brutal font-brutal hover:bg-white hover:text-black transition-none"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={
                                numDesiredPoints <= 0 ||
                                market.status !== "Active" ||
                                (isBuying && (!canAfford || !hasEnoughLiquidity)) ||
                                (!isBuying && !canSell)
                            }
                            className={`flex-1 py-3 px-4 border-brutal font-brutal transition-none ${
                                isBuying
                                    ? "btn-brutal disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    : "btn-danger disabled:bg-gray-600 disabled:cursor-not-allowed"
                            }`}
                        >
                            {isBuying ? "BUY" : "SELL"} POINTS
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
