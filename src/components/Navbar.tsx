import { Link, useLocation } from "react-router-dom";
import {
    LuHouse as Home,
    LuTrendingUp as TrendingUp,
    LuBriefcase as Briefcase,
    LuTrophy as Trophy,
    LuUsers as Users,
} from "react-icons/lu";
import { cn } from "@/utils/cn";
import logo from "@/assets/roxy-logo.png";
import { WalletConnect } from "@/components/wallet/WalletConnect";

const navItems = [
    { path: "/app", icon: Home, label: "Dashboard" },
    { path: "/app/markets", icon: TrendingUp, label: "Markets" },
    { path: "/app/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/app/guilds", icon: Users, label: "Guilds" },
];

export function Navbar() {
    const location = useLocation();

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

                    {/* User Info / Wallet Connect */}
                    <div className="p-4 border-t-brutal-thick">
                        <WalletConnect />
                    </div>
                </div>
            </nav>
        </>
    );
}
