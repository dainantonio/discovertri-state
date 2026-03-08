import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Wand2,
  XCircle,
} from 'lucide-react'
import { CATEGORIES, REGIONS } from './data/listings.js'
import { generateItinerary } from './services/aiPlanner.js'
import { runConciergeWorkflow } from './services/agentOrchestrator.js'
import { parseIntent } from './services/intentService.js'
import { fetchListings } from './services/listingService.js'

const confidenceStyles = {
  low: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-emerald-100 text-emerald-700',
}

function Badge({ label, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {label}
    </span>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All Areas')
  const [category, setCategory] = useState('all')
  const [groupType, setGroupType] = useState('families')
  const [budget, setBudget] = useState('low')
  const [constraints, setConstraints] = useState([])
  const [listings, setListings] = useState([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [agentPrompt, setAgentPrompt] = useState('Plan a budget family day outdoors in Huntington')
  const [intent, setIntent] = useState(parseIntent(''))
  const [workflowResult, setWorkflowResult] = useState(null)
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)
  const [workflowError, setWorkflowError] = useState('')

  useEffect(() => {
    setIsLoadingListings(true)
    fetchListings({ query, region, category })
      .then(setListings)
      .finally(() => setIsLoadingListings(false))
  }, [query, region, category])

  const itinerary = useMemo(
    () => generateItinerary({ budget, groupType, region, constraints }),
    [budget, groupType, region, constraints],
  )

  const applyAgentPrompt = () => {
    const parsedIntent = parseIntent(agentPrompt)
    setIntent(parsedIntent)

    if (parsedIntent.groupType) setGroupType(parsedIntent.groupType)
    if (parsedIntent.budget) setBudget(parsedIntent.budget)

    setConstraints(parsedIntent.constraints)
    setQuery(parsedIntent.constraints.includes('outdoor') ? 'outdoor' : '')
    setCategory(parsedIntent.constraints.includes('food') ? 'food' : 'all')
  }

  const clearFilters = () => {
    setQuery('')
    setRegion('All Areas')
    setCategory('all')
    setConstraints([])
  }

  const runWorkflow = async () => {
    setIsRunningWorkflow(true)
    setWorkflowError('')
    try {
      const result = await runConciergeWorkflow({ prompt: agentPrompt, region, category })
      setWorkflowResult(result)
    } catch {
      setWorkflowError('Workflow failed. Please retry or adjust your prompt.')
      setWorkflowResult(null)
    } finally {
      setIsRunningWorkflow(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white py-10 px-4 border-b border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <p className="text-emerald-300 uppercase text-xs tracking-wide font-semibold">Phase 4</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Discover Tri-State Agent Workflow</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">
            Production-hardening: improved UI states, safe retries, and deterministic workflow observability.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-violet-600" /> AI Prompt to Controls
            </p>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                value={agentPrompt}
                onChange={(event) => setAgentPrompt(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="Describe your perfect outing"
              />
              <button
                onClick={applyAgentPrompt}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-semibold"
              >
                Apply
              </button>
              <button
                onClick={runWorkflow}
                disabled={isRunningWorkflow}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isRunningWorkflow ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Run Agents
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge label={`intent: ${intent.confidence}`} tone="violet" />
              {constraints.length > 0 ? (
                constraints.map((constraint) => (
                  <Badge key={constraint} label={`constraint: ${constraint}`} tone="slate" />
                ))
              ) : (
                <span className="text-xs text-slate-500">No constraints parsed yet.</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 grid md:grid-cols-3 gap-3 shadow-sm">
            <label className="text-sm">
              <span className="font-semibold block mb-1">Search</span>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full outline-none"
                  placeholder="Try: family, arts, trails"
                />
              </div>
            </label>

            <label className="text-sm">
              <span className="font-semibold block mb-1">Region</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                {REGIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="font-semibold block mb-1">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Listings ({listings.length})</h2>
              <button onClick={clearFilters} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Reset filters
              </button>
            </div>

            {isLoadingListings ? (
              <div className="mt-4 text-sm text-slate-600 inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading listings...
              </div>
            ) : null}

            {!isLoadingListings && listings.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No matches found for current filters. Try broadening region/category or clearing search terms.
              </div>
            ) : null}

            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {listings.map((listing) => (
                <article key={listing.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/80">
                  <h3 className="font-semibold">{listing.name}</h3>
                  <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.region}</span>
                  </div>
                  <p className="text-sm mt-2 text-slate-700 line-clamp-3">{listing.description}</p>
                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" /> {listing.rating}
                    </span>
                    <Badge label={`relevance ${listing.relevanceScore}`} tone="slate" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-2xl border border-slate-200 p-4 h-fit shadow-sm">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600" />
            Agent Plan
          </h2>
          <p className="text-sm text-slate-600 mt-1">Deterministic planner with verification and citations.</p>

          {workflowError ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 inline-flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" /> {workflowError}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            <label className="text-sm block">
              <span className="font-semibold block mb-1">Group</span>
              <select
                value={groupType}
                onChange={(event) => setGroupType(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="families">Families</option>
                <option value="friends">Friends</option>
                <option value="couples">Couples</option>
                <option value="solo">Solo</option>
              </select>
            </label>

            <label className="text-sm block">
              <span className="font-semibold block mb-1">Budget</span>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              {itinerary.summary}
            </p>
            <p className="text-xs mt-2 text-slate-600">
              Planner confidence:{' '}
              <span className={`font-semibold rounded-full px-2 py-1 ${confidenceStyles[itinerary.confidence]}`}>
                {itinerary.confidence}
              </span>
            </p>
            <ol className="mt-2 text-sm text-slate-700 space-y-2">
              {itinerary.stops.map((stop) => (
                <li key={stop.order}>
                  <span className="font-semibold">{stop.order}. {stop.name}</span>
                  <p className="text-xs text-slate-600">{stop.reason}</p>
                  <p className="text-[11px] text-slate-500">source: {stop.citations.join(', ')}</p>
                </li>
              ))}
            </ol>
          </div>

          {workflowResult ? (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <h3 className="font-semibold text-sm mb-2">Workflow Trace</h3>
              <p className="text-xs text-slate-600 mb-2">
                Quality score: <span className="font-semibold">{workflowResult.metrics.qualityScore}/100</span>
                {' · '}Total duration: {workflowResult.metrics.totalDurationMs}ms
              </p>
              <p className="text-xs text-slate-600 mb-2">
                Top retrieval matches:{' '}
                <span className="font-semibold">
                  {workflowResult.retrieval.topResults.length > 0
                    ? workflowResult.retrieval.topResults.join(', ')
                    : 'none'}
                </span>
              </p>
              <ul className="space-y-2 text-xs">
                {workflowResult.trace.map((step) => (
                  <li key={step.agent} className="border border-slate-200 rounded-lg p-2 bg-white">
                    <p className="font-semibold">{step.agent}</p>
                    <p className="text-slate-600">{step.action}</p>
                    <p className="text-slate-500">{step.durationMs}ms</p>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-2 text-slate-600">
                Verified stops:{' '}
                <span className="font-semibold inline-flex items-center gap-1">
                  {workflowResult.itinerary.stops.filter((stop) => stop.verified).length ===
                  workflowResult.itinerary.stops.length ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-rose-600" />
                  )}
                  {workflowResult.itinerary.stops.filter((stop) => stop.verified).length}/
                  {workflowResult.itinerary.stops.length}
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
              Run the workflow to view per-agent trace, quality score, and verification stats.
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
