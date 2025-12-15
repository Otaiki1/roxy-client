import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TutorialStep = {
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector for the element to highlight
    position?: "top" | "bottom" | "left" | "right" | "center";
    page: string; // Route path where this step should be shown
};

export type TutorialProgress = {
    completed: boolean;
    currentStep: number;
    completedSteps: string[];
};

interface TutorialState {
    // Tutorial definitions
    tutorials: Record<string, TutorialStep[]>;
    
    // Progress tracking
    progress: Record<string, TutorialProgress>;
    
    // Active tutorial
    activeTutorial: string | null;
    isTutorialActive: boolean;
    
    // Actions
    initializeTutorial: (tutorialId: string) => void;
    completeStep: (tutorialId: string, stepId: string) => void;
    nextStep: (tutorialId: string) => void;
    skipTutorial: (tutorialId: string) => void;
    resetTutorial: (tutorialId: string) => void;
    getCurrentStep: (tutorialId: string) => TutorialStep | null;
    isStepCompleted: (tutorialId: string, stepId: string) => boolean;
    isTutorialCompleted: (tutorialId: string) => boolean;
}

// Define all tutorial steps
const tutorialDefinitions: Record<string, TutorialStep[]> = {
    dashboard: [
        {
            id: "welcome",
            title: "WELCOME TO ROXY!",
            description: "This is your dashboard. Here you can track your total profit, experience points, and view your achievements. Let's get started!",
            position: "center",
            page: "/app",
        },
        {
            id: "total-profit",
            title: "TOTAL PROFIT",
            description: "This shows your overall performance - how much you've earned minus what you've spent. Keep it positive to climb the leaderboard!",
            target: "[data-tutorial='total-profit']",
            position: "bottom",
            page: "/app",
        },
        {
            id: "experience",
            title: "EXPERIENCE POINTS",
            description: "Gain XP by trading, making predictions, and completing achievements. Level up to unlock new features and markets!",
            target: "[data-tutorial='experience']",
            position: "bottom",
            page: "/app",
        },
        {
            id: "daily-reward",
            title: "DAILY REWARD",
            description: "Claim 10 free points every 24 hours! Make sure to check back daily to boost your balance.",
            target: "[data-tutorial='daily-reward']",
            position: "bottom",
            page: "/app",
        },
        {
            id: "predictions",
            title: "PRICE PREDICTIONS",
            description: "Predict whether the market will rise, fall, or stay neutral. Correct predictions earn you rewards!",
            target: "[data-tutorial='predictions']",
            position: "bottom",
            page: "/app",
        },
        {
            id: "markets-button",
            title: "EXPLORE MARKETS",
            description: "Click here to view and trade in different markets. This is where the real action happens!",
            target: "[data-tutorial='markets-button']",
            position: "top",
            page: "/app",
        },
    ],
    markets: [
        {
            id: "markets-welcome",
            title: "TRADING MARKETS",
            description: "Welcome to the markets! Here you can buy and sell points with other players. Each market has its own liquidity and fees.",
            position: "center",
            page: "/app/markets",
        },
        {
            id: "market-card",
            title: "MARKET CARD",
            description: "Each card shows market details: total liquidity, fee percentage, and participants. Click a market to buy or sell points.",
            target: "[data-tutorial='market-card']",
            position: "bottom",
            page: "/app/markets",
        },
        {
            id: "buy-sell",
            title: "BUY & SELL",
            description: "Use the BUY POINTS button to invest in a market, or SELL POINTS (Level 5+) to exit your position. Watch the liquidity to make smart trades!",
            target: "[data-tutorial='buy-sell']",
            position: "top",
            page: "/app/markets",
        },
    ],
    portfolio: [
        {
            id: "portfolio-welcome",
            title: "YOUR PORTFOLIO",
            description: "Track all your investments and positions across different markets. Monitor your performance and manage your assets here.",
            position: "center",
            page: "/app/portfolio",
        },
    ],
    leaderboard: [
        {
            id: "leaderboard-welcome",
            title: "LEADERBOARD",
            description: "Compete with other traders! Climb the rankings by increasing your total profit and reputation. Top traders get special rewards!",
            position: "center",
            page: "/app/leaderboard",
        },
    ],
    guilds: [
        {
            id: "guilds-welcome",
            title: "GUILDS",
            description: "Join or create a guild to team up with other traders. Work together to dominate the markets and compete as a group!",
            position: "center",
            page: "/app/guilds",
        },
    ],
};

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set, get) => ({
            tutorials: tutorialDefinitions,
            progress: {},
            activeTutorial: null,
            isTutorialActive: false,

            initializeTutorial: (tutorialId: string) => {
                const state = get();
                const tutorial = state.tutorials[tutorialId];
                
                if (!tutorial || tutorial.length === 0) return;

                // Check if tutorial is already completed
                const existingProgress = state.progress[tutorialId];
                if (existingProgress?.completed) return;

                // Initialize progress if it doesn't exist
                if (!existingProgress) {
                    set((state) => ({
                        progress: {
                            ...state.progress,
                            [tutorialId]: {
                                completed: false,
                                currentStep: 0,
                                completedSteps: [],
                            },
                        },
                        activeTutorial: tutorialId,
                        isTutorialActive: true,
                    }));
                } else {
                    set({
                        activeTutorial: tutorialId,
                        isTutorialActive: true,
                    });
                }
            },

            completeStep: (tutorialId: string, stepId: string) => {
                set((state) => {
                    const progress = state.progress[tutorialId];
                    if (!progress) return state;

                    const updatedCompletedSteps = [...progress.completedSteps, stepId];
                    const tutorial = state.tutorials[tutorialId];
                    const currentStepIndex = progress.currentStep;
                    const isLastStep = currentStepIndex >= tutorial.length - 1;

                    return {
                        progress: {
                            ...state.progress,
                            [tutorialId]: {
                                ...progress,
                                completedSteps: updatedCompletedSteps,
                                currentStep: isLastStep
                                    ? progress.currentStep
                                    : progress.currentStep + 1,
                                completed: isLastStep,
                            },
                        },
                        isTutorialActive: !isLastStep,
                        activeTutorial: isLastStep ? null : tutorialId,
                    };
                });
            },

            nextStep: (tutorialId: string) => {
                set((state) => {
                    const progress = state.progress[tutorialId];
                    if (!progress) return state;

                    const tutorial = state.tutorials[tutorialId];
                    const nextStepIndex = progress.currentStep + 1;

                    if (nextStepIndex >= tutorial.length) {
                        return {
                            progress: {
                                ...state.progress,
                                [tutorialId]: {
                                    ...progress,
                                    completed: true,
                                },
                            },
                            activeTutorial: null,
                            isTutorialActive: false,
                        };
                    }

                    return {
                        progress: {
                            ...state.progress,
                            [tutorialId]: {
                                ...progress,
                                currentStep: nextStepIndex,
                            },
                        },
                    };
                });
            },

            skipTutorial: (tutorialId: string) => {
                set((state) => {
                    const tutorial = state.tutorials[tutorialId];
                    if (!tutorial) return state;

                    return {
                        progress: {
                            ...state.progress,
                            [tutorialId]: {
                                completed: true,
                                currentStep: tutorial.length - 1,
                                completedSteps: tutorial.map((s) => s.id),
                            },
                        },
                        activeTutorial: null,
                        isTutorialActive: false,
                    };
                });
            },

            resetTutorial: (tutorialId: string) => {
                set((state) => ({
                    progress: {
                        ...state.progress,
                        [tutorialId]: {
                            completed: false,
                            currentStep: 0,
                            completedSteps: [],
                        },
                    },
                }));
            },

            getCurrentStep: (tutorialId: string) => {
                const state = get();
                const progress = state.progress[tutorialId];
                const tutorial = state.tutorials[tutorialId];

                if (!progress || !tutorial) return null;

                return tutorial[progress.currentStep] || null;
            },

            isStepCompleted: (tutorialId: string, stepId: string) => {
                const state = get();
                const progress = state.progress[tutorialId];
                return progress?.completedSteps.includes(stepId) || false;
            },

            isTutorialCompleted: (tutorialId: string) => {
                const state = get();
                const progress = state.progress[tutorialId];
                return progress?.completed || false;
            },
        }),
        {
            name: "roxy-tutorial-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

