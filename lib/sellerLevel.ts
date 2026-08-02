// Shared logic for computing a seller's trust badge from their track record.
// Used on the public profile page and in the dashboard overview so both
// places agree on what "Level 2" or "Top Rated" actually means.

export interface SellerLevelInfo {
  label: string
  color: string // CSS var name, e.g. 'var(--text-muted)'
}

export function getSellerLevel(completedOrders: number, avgRating: number | null): SellerLevelInfo {
  if (completedOrders >= 50 && (avgRating ?? 0) >= 4.8) {
    return { label: 'Top Rated', color: 'var(--gold)' }
  }
  if (completedOrders >= 20 && (avgRating ?? 0) >= 4.5) {
    return { label: 'Level 2', color: 'var(--electric)' }
  }
  if (completedOrders >= 5) {
    return { label: 'Level 1', color: 'var(--green)' }
  }
  return { label: 'New Seller', color: 'var(--text-muted)' }
}

export function formatRating(avgRating: number | null, reviewCount: number): string {
  if (!avgRating || reviewCount === 0) return 'No reviews yet'
  return `${avgRating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})`
}
