import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion";
import {
    LuTrendingUp as TrendingUp,
    LuTrendingDown as TrendingDown,
    LuCheck as CheckCircle,
    LuX as XCircle,
    LuClock as Clock,
} from "react-icons/lu";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/lib/linera/hooks/useAuth";
import { useDailyOutcome, useWeeklyOutcome, useMonthlyOutcome } from "@/lib/linera/hooks/useLineraQueries";

export function Portfolio() {
    const { walletAddress } = useAuth();
    const { player, markets, predictions } = useGameStore();
    
    // Fetch prediction outcomes from Linera (unused for now but kept for future use)
    useDailyOutcome(walletAddress || null);
    useWeeklyOutcome(walletAddress || null);
    useMonthlyOutcome(walletAddress || null);

    // Calculate total profit
    const totalProfitCalculated = player.totalEarned - player.totalSpent;

    // Get player's market positions
    const marketPositions = markets
        .map((market) => {
            const position = market.positions[player.id] || 0;
            if (position === 0) return null;
            return {
                market,
                position,
            };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

    // Get resolved and active predictions
    const resolvedPredictions = predictions.filter((p) => p.resolved);
    const activePredictions = predictions.filter((p) => !p.resolved);

    // Mock data for portfolio growth chart (based on total profit over time)
    const chartData = [
        { day: "Mon", value: 0 },
        { day: "Tue", value: 5000 },
        { day: "Wed", value: 3000 },
        { day: "Thu", value: 8000 },
        { day: "Fri", value: 12000 },
        { day: "Sat", value: 15000 },
        { day: "Sun", value: totalProfitCalculated },
    ];

    const formatPoints = (points: number) => {
        return points.toLocaleString() + " PTS";
    };

    const getPredictionReward = (period: string) => {
        switch (period) {
            case "Daily":
                return 100;
            case "Weekly":
                return 500;
            case "Monthly":
                return 1000;
            default:
                return 0;
        }
    };

    const getPredictionStatus = (prediction: typeof predictions[0]) => {
        if (!prediction.resolved) {
            return {
                icon: <Clock className="text-accent" size={16} />,
                text: "PENDING",
                color: "text-accent",
            };
        }
        if (prediction.correct) {
            return {
                icon: <CheckCircle className="text-success" size={16} />,
                text: "CORRECT",
                color: "text-success",
            };
        }
        return {
            icon: <XCircle className="text-danger" size={16} />,
            text: "WRONG",
            color: "text-danger",
        };
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 lg:pb-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-brutal text-primary mb-2">
                        PORTFOLIO
                    </h1>
                    <p className="font-mono-brutal text-white">
                        TRACK YOUR MARKET POSITIONS AND PREDICTIONS
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                    {/* Portfolio Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-brutal mb-6 lg:col-span-4"
                    >
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-brutal text-primary mb-2">
                                {totalProfitCalculated >= 0 ? "+" : ""}
                                {totalProfitCalculated.toLocaleString()} PTS
                            </h2>
                            <p className="font-mono-brutal text-white mb-4">
                                TOTAL PROFIT
                            </p>

                            <div className="flex items-center justify-center lg:justify-start gap-2">
                                {totalProfitCalculated >= 0 ? (
                                    <TrendingUp className="text-primary" size={20} />
                                ) : (
                                    <TrendingDown className="text-accent" size={20} />
                                )}
                                <span
                                    className={`text-lg font-brutal ${
                                        totalProfitCalculated >= 0
                                            ? "text-primary"
                                            : "text-accent"
                                    }`}
                                >
                                    {totalProfitCalculated >= 0 ? "+" : ""}
                                    {totalProfitCalculated.toLocaleString()} POINTS
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono-brutal text-white">
                                        TOTAL EARNED
                                    </span>
                                    <span className="font-brutal text-primary">
                                        {formatPoints(player.totalEarned)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-mono-brutal text-white">
                                        TOTAL SPENT
                                    </span>
                                    <span className="font-brutal text-accent">
                                        {formatPoints(player.totalSpent)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-mono-brutal text-white">
                                        CURRENT BALANCE
                                    </span>
                                    <span className="font-brutal text-primary">
                                        {formatPoints(player.tokenBalance)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Portfolio Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-brutal mb-6 lg:col-span-8"
                    >
                        <h3 className="text-lg font-brutal text-primary mb-4">
                            PROFIT GROWTH (7 DAYS)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#374151"
                                    />
                                    <XAxis dataKey="day" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1F2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px",
                                            color: "#FFFFFF",
                                        }}
                                        formatter={(value: number) => [
                                            `${value >= 0 ? "+" : ""}${value.toLocaleString()} PTS`,
                                            "Profit",
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#19c27c"
                                        strokeWidth={2}
                                        dot={{
                                            fill: "#19c27c",
                                            strokeWidth: 2,
                                            r: 4,
                                        }}
                                        activeDot={{ r: 6, fill: "#19c27c" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Market Positions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-brutal mb-6 lg:col-span-12"
                    >
                        <h3 className="text-lg font-brutal text-primary mb-4">
                            MARKET POSITIONS
                        </h3>

                        {marketPositions.length > 0 ? (
                            <div className="space-y-4">
                                {marketPositions.map((item, index) => (
                                        <motion.div
                                        key={item.market.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        className="p-4 border bg-card"
                                        >
                                        <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-brutal text-primary">
                                                    {item.market.title}
                                                        </h4>
                                                        <p className="text-sm font-mono-brutal text-white">
                                                    Fee: {item.market.feePercent}% •{" "}
                                                    {item.market.status}
                                                        </p>
                                                    </div>
                                                <div className="text-right">
                                                <p className="font-brutal text-lg text-primary">
                                                    {formatPoints(item.position)}
                                                    </p>
                                                <p className="text-xs font-mono-brutal text-white">
                                                    YOUR POSITION
                                                </p>
                                                </div>
                                            </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="font-mono-brutal text-white">
                                                    MARKET LIQUIDITY
                                                    </p>
                                                <p className="font-brutal text-white">
                                                    {formatPoints(item.market.totalLiquidity)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-mono-brutal text-white">
                                                    PARTICIPANTS
                                                    </p>
                                                    <p className="font-brutal text-white">
                                                    {item.market.totalParticipants}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-mono-brutal text-white">
                                                    CREATOR
                                                </p>
                                                <p className="font-brutal text-white">
                                                    {item.market.creator.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white">
                                <div className="mb-4 flex justify-center">
                                    <TrendingUp
                                        size={64}
                                        className="text-primary"
                                    />
                                </div>
                                <h3 className="text-lg font-brutal mb-2 text-primary">
                                    NO MARKET POSITIONS
                                </h3>
                                <p className="font-mono-brutal">
                                    START TRADING IN MARKETS TO BUILD YOUR POSITIONS!
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Price Predictions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-brutal lg:col-span-12"
                    >
                        <h3 className="text-lg font-brutal text-primary mb-4">
                            PRICE PREDICTIONS
                        </h3>

                        {predictions.length > 0 ? (
                            <div className="space-y-4">
                                {/* Active Predictions */}
                                {activePredictions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-brutal text-accent mb-3">
                                            ACTIVE PREDICTIONS
                                        </h4>
                                        {activePredictions.map((prediction, index) => {
                                            const status = getPredictionStatus(prediction);
                                            const reward = getPredictionReward(prediction.period);

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 border bg-black mb-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {status.icon}
                                                            <div>
                                                                <h4 className="font-brutal text-primary">
                                                                    {prediction.period} Prediction
                                                                </h4>
                                                                <p className="text-sm font-mono-brutal text-white">
                                                                    Outcome: {prediction.outcome}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-brutal ${status.color}`}>
                                                                {status.text}
                                                            </p>
                                                            <p className="text-xs font-mono-brutal text-white">
                                                                Reward: {formatPoints(reward)}
                                                    </p>
                                                </div>
                                            </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Resolved Predictions */}
                                {resolvedPredictions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-brutal text-primary mb-3">
                                            RESOLVED PREDICTIONS
                                        </h4>
                                        {resolvedPredictions.map((prediction, index) => {
                                            const status = getPredictionStatus(prediction);
                                            const reward = getPredictionReward(prediction.period);

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`p-4 border mb-3 ${
                                                        prediction.correct
                                                            ? "bg-success/10 border-success"
                                                            : "bg-danger/10 border-danger"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {status.icon}
                                                            <div>
                                                                <h4 className="font-brutal text-primary">
                                                                    {prediction.period} Prediction
                                                                </h4>
                                                                <p className="text-sm font-mono-brutal text-white">
                                                                    Outcome: {prediction.outcome}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-brutal ${status.color}`}>
                                                                {status.text}
                                                            </p>
                                                            <p
                                                                className={`text-sm font-brutal ${
                                                                    prediction.correct
                                                                ? "text-success"
                                                                : "text-danger"
                                                        }`}
                                                    >
                                                                {prediction.correct
                                                                    ? `+${formatPoints(reward)}`
                                                                    : `-${formatPoints(reward)}`}
                                                            </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white">
                                <div className="mb-4 flex justify-center">
                                    <TrendingUp
                                        size={64}
                                        className="text-primary"
                                    />
                                </div>
                                <h3 className="text-lg font-brutal mb-2 text-primary">
                                    NO PREDICTIONS YET
                                </h3>
                                <p className="font-mono-brutal">
                                    MAKE PRICE PREDICTIONS TO START EARNING REWARDS!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
