import { LISTINGS } from '../data/listings.js'

const normalize = (value) => value.trim().toLowerCase()

const scoreListing = (listing, query) => {
  if (!query) return 1

  const q = normalize(query)
  const haystack = [
    listing.name,
    listing.region,
    listing.description,
    ...(listing.tags ?? []),
    ...(listing.aiMetadata?.vibe ?? []),
  ]
    .join(' ')
    .toLowerCase()

  if (!haystack.includes(q)) return 0

  // lightweight retrieval baseline score for phase 1
  let score = 1
  if (listing.name.toLowerCase().includes(q)) score += 2
  if (listing.tags.some((tag) => tag.toLowerCase().includes(q))) score += 1
  if (listing.description.toLowerCase().includes(q)) score += 1
  return score
}

export async function fetchListings(filters = {}) {
  const { query = '', region = 'All Areas', category = 'all' } = filters

  const matches = LISTINGS.filter((listing) => {
    const regionMatch = region === 'All Areas' || listing.region === region
    const categoryMatch = category === 'all' || listing.category === category
    const relevanceScore = scoreListing(listing, query)
    return regionMatch && categoryMatch && relevanceScore > 0
  })
    .map((listing) => ({ ...listing, relevanceScore: scoreListing(listing, query) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore || b.rating - a.rating)

  // Simulate an API boundary so we can replace with backend call later.
  await new Promise((resolve) => setTimeout(resolve, 100))
  return matches
}
