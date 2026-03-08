const GROUP_KEYWORDS = {
  families: ['family', 'kids', 'children'],
  friends: ['friends', 'group', 'crew'],
  couples: ['couple', 'date', 'romantic'],
  solo: ['solo', 'myself', 'alone'],
}

const BUDGET_KEYWORDS = {
  low: ['cheap', 'budget', 'low cost', 'affordable', 'free'],
  medium: ['mid', 'moderate', 'medium'],
  high: ['luxury', 'premium', 'high-end', 'splurge'],
}

export function parseIntent(prompt = '') {
  const text = prompt.toLowerCase()

  const parsedGroupType = Object.entries(GROUP_KEYWORDS).find(([, words]) =>
    words.some((word) => text.includes(word)),
  )

  const parsedBudget = Object.entries(BUDGET_KEYWORDS).find(([, words]) =>
    words.some((word) => text.includes(word)),
  )

  const wantsOutdoor = ['outdoor', 'outside', 'nature', 'trail'].some((word) => text.includes(word))
  const wantsFood = ['food', 'eat', 'restaurant', 'brunch', 'dinner'].some((word) =>
    text.includes(word),
  )

  const constraints = []
  if (wantsOutdoor) constraints.push('outdoor')
  if (wantsFood) constraints.push('food')

  return {
    groupType: parsedGroupType?.[0] ?? null,
    budget: parsedBudget?.[0] ?? null,
    constraints,
    confidence: parsedGroupType || parsedBudget || constraints.length ? 'medium' : 'low',
  }
}
