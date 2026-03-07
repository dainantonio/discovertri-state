import { LISTINGS } from '../data/listings'

export function generateItinerary({ budget = 'low', groupType = 'families', region = 'All Areas' }) {
  const regionalPool =
    region === 'All Areas' ? LISTINGS : LISTINGS.filter((listing) => listing.region === region)

  const ranked = regionalPool
    .filter((listing) => listing.aiMetadata?.groupTypes?.includes(groupType))
    .map((listing) => {
      let score = listing.rating
      if (listing.aiMetadata?.budgetLevel === budget) score += 1.5
      if (listing.aiMetadata?.familyFriendly && groupType === 'families') score += 1
      return { ...listing, planScore: score }
    })
    .sort((a, b) => b.planScore - a.planScore)

  const picks = ranked.slice(0, 3)

  if (picks.length === 0) {
    return {
      summary: 'No strong itinerary match found yet. Try a different group type or region.',
      stops: [],
    }
  }

  return {
    summary: `Built a ${budget}-budget plan for ${groupType} with ${picks.length} stops.`,
    stops: picks.map((listing, index) => ({
      order: index + 1,
      name: listing.name,
      reason: `Matches ${groupType} interests with a ${listing.aiMetadata.budgetLevel} cost profile.`,
      region: listing.region,
    })),
  }
}
