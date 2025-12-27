/**
 * Utilities for converting between Linera Amount type and JavaScript numbers (points)
 * 
 * Linera Amount uses tokens where 1 token = 10^9 units
 * The contract uses Amount::from_tokens() and amount.to_tokens()
 */

/**
 * Convert points (number) to Linera Amount representation
 * For now, we'll treat points as tokens directly (1 point = 1 token)
 * This may need adjustment based on actual contract implementation
 */
export function pointsToAmount(points: number): string {
    // Convert to string representation that Linera expects
    // Linera Amount uses tokens, so we convert points to tokens
    // If 1 point = 1 token, we can use the number directly
    // The actual Amount type will be handled by the GraphQL query
    return points.toString();
}

/**
 * Convert Linera Amount representation to points (number)
 * For now, we'll treat tokens as points directly
 */
export function amountToPoints(amount: string | number): number {
    if (typeof amount === "number") {
        return amount;
    }
    // Parse the amount string (could be in various formats)
    // For now, assume it's a string representation of tokens
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) {
        return 0;
    }
    return parsed;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number | string): string {
    const points = typeof amount === "number" ? amount : amountToPoints(amount);
    return points.toLocaleString();
}

