import { LISTINGS } from '../data/listings.js'

const constraintMatcher = (listing, constraint) => {
  if (constraint === 'outdoor') {
    return ['outdoor', 'mixed'].includes(listing.aiMetadata?.indoorOutdoor)
  }

  if (constraint === 'food') {
    return listing.category === 'food'
  }

  return true
}

export function generateItinerary({
  budget = 'low',
  groupType = 'families',
  region = 'All Areas',
  constraints = [],
}) {
  const regionalPool =
    region === 'All Areas' ? LISTINGS : LISTINGS.filter((listing) => listing.region === region)

  const ranked = regionalPool
    .filter((listing) => listing.aiMetadata?.groupTypes?.includes(groupType))
    .filter((listing) => constraints.every((constraint) => constraintMatcher(listing, constraint)))
    .map((listing) => {
      let score = listing.rating
      if (listing.aiMetadata?.budgetLevel === budget) score += 1.5
      if (listing.aiMetadata?.familyFriendly && groupType === 'families') score += 1
      if (constraints.length > 0) score += 0.3 * constraints.length

      return { ...listing, planScore: Number(score.toFixed(2)) }
    })
    .sort((a, b) => b.planScore - a.planScore)

  const picks = ranked.slice(0, 3)

  if (picks.length === 0) {
    return {
      summary: 'No strong itinerary match found yet. Try adjusting your constraints.',
      confidence: 'low',
      stops: [],
    }
  }

  return {
    summary: `Built a ${budget}-budget plan for ${groupType} with ${picks.length} stops.`,
    confidence: picks.length >= 3 ? 'high' : 'medium',
    stops: picks.map((listing, index) => ({
      order: index + 1,
      name: listing.name,
      reason: `Fits ${groupType}, ${listing.aiMetadata.budgetLevel} budget, and scored ${listing.planScore}.`,
      region: listing.region,
      citations: [`listing:${listing.id}`],
    })),
  }
}
