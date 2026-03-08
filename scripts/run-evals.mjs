import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runConciergeWorkflow } from '../src/services/agentOrchestrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const promptsPath = path.join(__dirname, '..', 'evals', 'prompts.json')
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'))

let failures = 0

for (const scenario of prompts) {
  const result = await runConciergeWorkflow({
    prompt: scenario.prompt,
    region: scenario.region,
    category: scenario.category,
  })

  const failedReasons = []

  if (result.itinerary.stops.length < scenario.expect.minStops) {
    failedReasons.push(`expected at least ${scenario.expect.minStops} stops, got ${result.itinerary.stops.length}`)
  }

  for (const constraint of scenario.expect.requiredConstraints) {
    if (!result.intent.constraints.includes(constraint)) {
      failedReasons.push(`missing required parsed constraint: ${constraint}`)
    }
  }

  if (result.metrics.qualityScore < scenario.expect.minQualityScore) {
    failedReasons.push(
      `expected quality >= ${scenario.expect.minQualityScore}, got ${result.metrics.qualityScore}`,
    )
  }

  if (failedReasons.length > 0) {
    failures += 1
    console.error(`✗ ${scenario.name}`)
    for (const reason of failedReasons) console.error(`  - ${reason}`)
  } else {
    console.log(`✓ ${scenario.name}`)
  }
}

if (failures > 0) {
  process.exitCode = 1
}
