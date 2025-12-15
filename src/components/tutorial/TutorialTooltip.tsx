import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { LuX as X, LuArrowRight as ArrowRight } from "react-icons/lu";
import { useTutorialStore, type TutorialStep } from "@/store/tutorialStore";

interface TutorialTooltipProps {
    step: TutorialStep;
    tutorialId: string;
    onNext: () => void;
    onSkip: () => void;
}

export function TutorialTooltip({
    step,
    tutorialId,
    onNext,
    onSkip,
}: TutorialTooltipProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const { progress, tutorials } = useTutorialStore();

    useEffect(() => {
        if (step.position === "center") {
            // Position will be handled by CSS transforms
            return;
        }

        if (step.target) {
            const element = document.querySelector(step.target) as HTMLElement;
            setTargetElement(element);

            if (element) {
                const updatePosition = () => {
                    const rect = element.getBoundingClientRect();
                    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
                    const tooltipWidth = tooltipRect?.width || 320;
                    const tooltipHeight = tooltipRect?.height || 200;

                    let top = 0;
                    let left = 0;

                    switch (step.position) {
                        case "top":
                            top = rect.top - tooltipHeight - 20;
                            left = rect.left + rect.width / 2 - tooltipWidth / 2;
                            break;
                        case "bottom":
                            top = rect.bottom + 20;
                            left = rect.left + rect.width / 2 - tooltipWidth / 2;
                            break;
                        case "left":
                            top = rect.top + rect.height / 2 - tooltipHeight / 2;
                            left = rect.left - tooltipWidth - 20;
                            break;
                        case "right":
                            top = rect.top + rect.height / 2 - tooltipHeight / 2;
                            left = rect.right + 20;
                            break;
                        default:
                            top = rect.bottom + 20;
                            left = rect.left + rect.width / 2 - tooltipWidth / 2;
                    }

                    // Ensure tooltip stays within viewport
                    const padding = 20;
                    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
                    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

                    setPosition({ top, left });
                };

                updatePosition();
                window.addEventListener("resize", updatePosition);
                window.addEventListener("scroll", updatePosition, true);

                // Highlight the target element
                element.style.transition = "all 0.3s";
                element.style.zIndex = "1000";
                element.style.position = "relative";
                element.classList.add("tutorial-highlight");

                return () => {
                    window.removeEventListener("resize", updatePosition);
                    window.removeEventListener("scroll", updatePosition, true);
                    element.style.zIndex = "";
                    element.style.position = "";
                    element.classList.remove("tutorial-highlight");
                };
            }
        }
    }, [step.target, step.position]);

    const currentProgress = progress[tutorialId];
    const tutorial = tutorials[tutorialId];
    const isLastStep = currentProgress && tutorial
        ? currentProgress.currentStep >= tutorial.length - 1
        : false;
    
    const currentStepNumber = currentProgress?.currentStep ?? 0;
    const totalSteps = tutorial?.length ?? 1;
    const progressPercent = ((currentStepNumber + 1) / totalSteps) * 100;

    return (
        <>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[9998]"
                onClick={step.position === "center" ? undefined : onNext}
            />

            {/* Highlight overlay for target element */}
            {targetElement && step.target && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: targetElement.getBoundingClientRect().top + window.scrollY,
                        left: targetElement.getBoundingClientRect().left + window.scrollX,
                        width: targetElement.getBoundingClientRect().width,
                        height: targetElement.getBoundingClientRect().height,
                        border: "3px solid var(--color-primary)",
                        boxShadow: "0 0 20px var(--color-primary), inset 0 0 20px var(--color-primary)",
                        borderRadius: "0",
                    }}
                />
            )}

            {/* Tooltip */}
            <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`fixed z-[10000] w-80 ${
                    step.position === "center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
                }`}
                style={
                    step.position === "center"
                        ? {}
                        : {
                              top: `${position.top}px`,
                              left: `${position.left}px`,
                          }
                }
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-brutal border-2 border-primary bg-black p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={onSkip}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-brutal bg-black text-white hover:bg-primary hover:text-black transition-none"
                        aria-label="Skip tutorial"
                    >
                        <X size={16} />
                    </button>

                    {/* Content */}
                    <div className="mb-4">
                        <h3 className="text-xl font-brutal text-primary mb-3">
                            {step.title}
                        </h3>
                        <p className="font-mono-brutal text-white text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-black border h-2">
                                <motion.div
                                    className="bg-primary h-full border border-primary"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${progressPercent}%`,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-xs font-mono-brutal text-white">
                                {currentStepNumber + 1}/{totalSteps}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onSkip}
                            className="flex-1 py-2 px-4 bg-black text-white border-brutal font-brutal hover:bg-white hover:text-black transition-none text-sm"
                        >
                            SKIP
                        </button>
                        <button
                            onClick={onNext}
                            className="flex-1 btn-brutal flex items-center justify-center gap-2 text-sm"
                        >
                            {isLastStep ? "GET STARTED" : "NEXT"}
                            {!isLastStep && <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>

                {/* Arrow pointer (if not center) */}
                {step.target && step.position !== "center" && targetElement && (
                    <div
                        className="absolute w-0 h-0"
                        style={{
                            ...(step.position === "top" && {
                                bottom: "-10px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                borderLeft: "10px solid transparent",
                                borderRight: "10px solid transparent",
                                borderTop: "10px solid var(--color-primary)",
                            }),
                            ...(step.position === "bottom" && {
                                top: "-10px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                borderLeft: "10px solid transparent",
                                borderRight: "10px solid transparent",
                                borderBottom: "10px solid var(--color-primary)",
                            }),
                            ...(step.position === "left" && {
                                right: "-10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                borderTop: "10px solid transparent",
                                borderBottom: "10px solid transparent",
                                borderLeft: "10px solid var(--color-primary)",
                            }),
                            ...(step.position === "right" && {
                                left: "-10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                borderTop: "10px solid transparent",
                                borderBottom: "10px solid transparent",
                                borderRight: "10px solid var(--color-primary)",
                            }),
                        }}
                    />
                )}
            </motion.div>
        </>
    );
}

