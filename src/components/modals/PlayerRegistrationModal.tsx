import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/linera/hooks/useAuth";
import { useGameStore } from "@/store/gameStore";
import { useQueryClient } from "@tanstack/react-query";
import { LuX as CloseIcon, LuUser as UserIcon } from "react-icons/lu";

interface PlayerRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PlayerRegistrationModal({
    isOpen,
    onClose,
}: PlayerRegistrationModalProps) {
    const { walletAddress } = useAuth();
    const queryClient = useQueryClient();
    const { registerPlayer, error, setError } = useGameStore();
    const [displayName, setDisplayName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!displayName.trim()) {
            setError("Please enter a display name");
            return;
        }

        if (!walletAddress) {
            setError("Wallet not connected");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const success = await registerPlayer(displayName.trim(), walletAddress);
            
            if (success) {
                // Invalidate player queries to refetch updated data
                await queryClient.invalidateQueries({ queryKey: ["linera", "player", walletAddress] });
                await queryClient.invalidateQueries({ queryKey: ["linera", "player", walletAddress, "totalPoints"] });
                
                // Refetch player data to ensure it's loaded
                await queryClient.refetchQueries({ queryKey: ["linera", "player", walletAddress] });
                
                // Close modal on success (guard will detect player exists and keep it closed)
                onClose();
                setDisplayName("");
            } else {
                // Error is set by store action
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register player");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setDisplayName("");
            setError(null);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-brutal bg-black border-2 border-primary max-w-md w-full relative">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Close"
                            >
                                <CloseIcon className="text-white" size={20} />
                            </button>

                            {/* Header */}
                            <div className="p-6 border-b-2 border-primary">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/20 rounded-lg">
                                        <UserIcon className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-brutal text-primary">
                                            WELCOME TO ROXY
                                        </h2>
                                        <p className="text-sm font-mono-brutal text-text-body mt-1">
                                            Set up your player profile
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label
                                        htmlFor="displayName"
                                        className="block text-sm font-mono-brutal text-text-body mb-2"
                                    >
                                        DISPLAY NAME
                                    </label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your display name"
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 text-white font-mono-brutal focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        autoFocus
                                        maxLength={50}
                                    />
                                    <p className="text-xs font-mono-brutal text-text-body mt-2">
                                        This name will be visible to other players
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-500/20 border-2 border-red-500 rounded"
                                    >
                                        <p className="text-sm font-mono-brutal text-red-400">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !displayName.trim()}
                                    className="w-full btn-brutal bg-primary text-black font-brutal py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            <span>Registering...</span>
                                        </>
                                    ) : (
                                        <span>REGISTER PLAYER</span>
                                    )}
                                </button>

                                <p className="text-xs font-mono-brutal text-text-body text-center">
                                    By continuing, you agree to register your player on the Linera blockchain
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

