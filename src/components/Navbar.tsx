import { Link, useLocation } from "react-router-dom";
import {
    LuHouse as Home,
    LuTrendingUp as TrendingUp,
    LuBriefcase as Briefcase,
    LuTrophy as Trophy,
    LuUsers as Users,
    LuUser as User,
    LuLogOut as LogOut,
} from "react-icons/lu";
import { cn } from "@/utils/cn";
import logo from "@/assets/roxy-logo.png";
import { useWallet } from "@/context/WalletContext";

const navItems = [
    { path: "/app", icon: Home, label: "Dashboard" },
    { path: "/app/markets", icon: TrendingUp, label: "Markets" },
    { path: "/app/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/app/guilds", icon: Users, label: "Guilds" },
];

export function Navbar() {
    const location = useLocation();
    const { chainId, isAuthenticated, disconnect } = useWallet();

    // Format Chain ID for display (truncate to show first 8 and last 6 chars)
    const formatChainId = (id?: string) => {
        if (!id) return "Not Connected";
        if (id.length <= 14) return id;
        return `${id.slice(0, 8)}...${id.slice(-6)}`;
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to disconnect your Linera chain?")) {
            disconnect();
        }
    };

    const handleCopyChainId = async () => {
        if (chainId) {
            try {
                await navigator.clipboard.writeText(chainId);
                alert("Chain ID copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy Chain ID:", err);
            }
        }
    };

    return (
        <>
            {/* Mobile Navigation - Bottom */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-brutal-thick lg:hidden">
                <div className="flex justify-around items-center py-2 px-4">
                    {navItems.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname === path;

                        return (
                            <Link
                                key={path}
                                to={path}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-3 border-brutal transition-none",
                                    isActive
                                        ? "bg-primary text-black font-brutal"
                                        : "bg-black text-white hover:bg-white hover:text-black"
                                )}
                            >
                                <Icon size={20} className="font-bold" />
                                <span className="text-xs font-brutal">
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Navigation - Sidebar */}
            <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 z-50 bg-black border-r-brutal-thick">
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="p-6 border-b-brutal-thick">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={logo}
                                alt="Roxy Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <h1 className="text-xl font-brutal text-primary">
                                    CRYPTO MANAGER
                                </h1>
                                <p className="text-xs font-mono-brutal text-text-body">
                                    PORTFOLIO GAME
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 py-6">
                        <div className="space-y-0 px-4">
                            {navItems.map(({ path, icon: Icon, label }) => {
                                const isActive = location.pathname === path;

                                return (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={cn(
                                            "flex items-center gap-3 p-3 border-brutal transition-none group",
                                            isActive
                                                ? "bg-primary text-black font-brutal"
                                                : "bg-black text-white hover:bg-white hover:text-black"
                                        )}
                                    >
                                        <Icon size={20} className="font-bold" />
                                        <span className="font-brutal">
                                            {label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-t-brutal-thick space-y-3">
                        {isAuthenticated && chainId ? (
                            <>
                                <div className="space-y-2">
                                    <p className="text-xs font-brutal text-primary uppercase">
                                        Your Linera Chain ID
                                    </p>
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity p-2 bg-black border-brutal"
                                        onClick={handleCopyChainId}
                                        title={`Click to copy full Chain ID: ${chainId}`}
                                    >
                                        <div className="w-8 h-8 bg-primary border-brutal flex items-center justify-center text-sm font-brutal">
                                            <User size={16} className="text-black" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <code className="text-sm font-mono-brutal text-primary block truncate">
                                                {formatChainId(chainId)}
                                            </code>
                                            <p className="text-xs font-mono-brutal text-text-muted">
                                                Click to copy
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono-brutal text-text-muted text-left">
                                        Your personal Linera microchain is active
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-2 border-brutal bg-black text-white hover:bg-white hover:text-black transition-none font-brutal text-xs uppercase"
                                    title="Disconnect Linera Chain"
                                >
                                    <LogOut size={14} />
                                    <span>DISCONNECT</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-800 border-brutal flex items-center justify-center text-sm font-brutal">
                                    <User size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-brutal text-gray-400">
                                        NOT CONNECTED
                                    </p>
                                    <p className="text-xs font-mono-brutal text-text-muted">
                                        Connect to Linera to start
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
