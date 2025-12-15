import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { TutorialTooltip } from "./TutorialTooltip";
import { useTutorialStore } from "@/store/tutorialStore";

interface TutorialProviderProps {
    children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
    const location = useLocation();
    const {
        activeTutorial,
        isTutorialActive,
        initializeTutorial,
        getCurrentStep,
        nextStep,
        skipTutorial,
        completeStep,
        isTutorialCompleted,
    } = useTutorialStore();

    // Determine which tutorial to show based on current route
    const getTutorialIdForRoute = (path: string): string | null => {
        if (path === "/app" || path === "/app/") return "dashboard";
        if (path === "/app/markets") return "markets";
        if (path === "/app/portfolio") return "portfolio";
        if (path === "/app/leaderboard") return "leaderboard";
        if (path === "/app/guilds") return "guilds";
        return null;
    };

    useEffect(() => {
        const tutorialId = getTutorialIdForRoute(location.pathname);
        
        if (tutorialId && !isTutorialCompleted(tutorialId)) {
            // Small delay to ensure page is rendered
            const timer = setTimeout(() => {
                initializeTutorial(tutorialId);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, initializeTutorial, isTutorialCompleted]);

    const currentTutorialId = getTutorialIdForRoute(location.pathname);
    const currentStep = currentTutorialId
        ? getCurrentStep(currentTutorialId)
        : null;

    const handleNext = () => {
        if (!currentTutorialId) return;

        const step = getCurrentStep(currentTutorialId);
        if (step) {
            completeStep(currentTutorialId, step.id);
            nextStep(currentTutorialId);
        }
    };

    const handleSkip = () => {
        if (!currentTutorialId) return;
        skipTutorial(currentTutorialId);
    };

    // Only show tutorial if:
    // 1. We're on a page with a tutorial
    // 2. Tutorial is active
    // 3. There's a current step
    // 4. The tutorial matches the current route
    const shouldShowTutorial =
        currentTutorialId &&
        isTutorialActive &&
        activeTutorial === currentTutorialId &&
        currentStep &&
        currentStep.page === location.pathname;

    return (
        <>
            {children}
            <AnimatePresence>
                {shouldShowTutorial && currentStep && (
                    <TutorialTooltip
                        key={currentStep.id}
                        step={currentStep}
                        tutorialId={currentTutorialId}
                        onNext={handleNext}
                        onSkip={handleSkip}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

