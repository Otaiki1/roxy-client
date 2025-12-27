import { useEffect, useState } from "react";
import { useAuth } from "@/lib/linera/hooks/useAuth";
import { usePlayer } from "@/lib/linera/hooks/useLineraQueries";
import { PlayerRegistrationModal } from "./modals/PlayerRegistrationModal";

interface PlayerRegistrationGuardProps {
    children: React.ReactNode;
}

/**
 * Component that checks if the player is registered and shows registration modal if not
 * Should be placed in the app layout to protect routes that require player registration
 */
export function PlayerRegistrationGuard({
    children,
}: PlayerRegistrationGuardProps) {
    const { walletAddress, isConnectedToLinera, isAppConnected } = useAuth();
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);

    // Fetch player data to check if registered
    const {
        data: player,
        isLoading: isLoadingPlayer,
    } = usePlayer(walletAddress || null);

    // Check if player is registered after Linera connection is established
    useEffect(() => {
        // Only check if connected to Linera and app is set
        if (!isConnectedToLinera || !isAppConnected || !walletAddress) {
            setShowRegistrationModal(false);
            setHasCheckedRegistration(false);
            return;
        }

        // Wait for player query to complete
        if (isLoadingPlayer) {
            return;
        }

        // Mark that we've checked (only once per connection session)
        if (!hasCheckedRegistration) {
            setHasCheckedRegistration(true);

            // If player query returns null/undefined after loading, player is not registered
            // GraphQL errors that result in null data indicate player doesn't exist (valid case)
            // Network/other errors might set isPlayerError, but we still want to check
            if (!player) {
                // Player doesn't exist - show registration modal
                setShowRegistrationModal(true);
            } else {
                // Player exists - don't show modal
                setShowRegistrationModal(false);
            }
        } else {
            // After initial check, update modal state based on player data changes
            // This handles the case where registration succeeds and player data becomes available
            if (player) {
                setShowRegistrationModal(false);
            }
        }
    }, [
        isConnectedToLinera,
        isAppConnected,
        walletAddress,
        player,
        isLoadingPlayer,
        hasCheckedRegistration,
    ]);

    // Reset check state when wallet disconnects
    useEffect(() => {
        if (!walletAddress) {
            setHasCheckedRegistration(false);
            setShowRegistrationModal(false);
        }
    }, [walletAddress]);

    // Don't block rendering while checking
    // The modal will show once we determine the player is not registered
    return (
        <>
            {children}
            <PlayerRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
            />
        </>
    );
}

