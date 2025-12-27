import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { Markets } from "@/pages/Markets";
import { Portfolio } from "@/pages/Portfolio";
import { Leaderboard } from "@/pages/Leaderboard";
import { Guilds } from "@/pages/Guilds";
import { Navbar } from "@/components/Navbar";
import { CanvasBackground } from "@/components/CanvasBackground";
import { featureFlags } from "@/config/featureFlags";
import {
    ArcadeNavbar,
    CanvasBackgroundPIXI,
    GameHUD,
    GameSoundManager,
} from "@/components/game";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import { useMockMode } from "@/hooks/useMockMode";
import { MockModeIndicator } from "@/components/MockModeIndicator";
import { PlayerRegistrationGuard } from "@/components/PlayerRegistrationGuard";

function App() {
    // Initialize mock mode (auto-enables when not authenticated)
    useMockMode();

    const BackgroundComponent = featureFlags.USE_PIXI_BACKGROUND
        ? CanvasBackgroundPIXI
        : CanvasBackground;

    const NavigationComponent = featureFlags.USE_ARCADE_NAV
        ? ArcadeNavbar
        : Navbar;

    const contentWrapperClass = featureFlags.USE_ARCADE_NAV
        ? "relative z-10"
        : "relative z-10 lg:ml-64";

    return (
        <Router>
            <div className="min-h-screen bg-background text-text">
                <MockModeIndicator />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route
                        path="/app/*"
                        element={
                            <PlayerRegistrationGuard>
                                <BackgroundComponent />
                                {featureFlags.USE_GAME_HUD && <GameHUD />}
                                <GameSoundManager muted />
                                <TutorialProvider>
                                    <div className={contentWrapperClass}>
                                        <Routes>
                                            <Route
                                                path="/"
                                                element={<Dashboard />}
                                            />
                                            <Route
                                                path="/markets"
                                                element={<Markets />}
                                            />
                                            <Route
                                                path="/portfolio"
                                                element={<Portfolio />}
                                            />
                                            <Route
                                                path="/leaderboard"
                                                element={<Leaderboard />}
                                            />
                                            <Route
                                                path="/guilds"
                                                element={<Guilds />}
                                            />
                                        </Routes>
                                    </div>
                                    <NavigationComponent />
                                </TutorialProvider>
                            </PlayerRegistrationGuard>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
