import { useEffect, useMemo, useState } from 'react'
import { Bot, MapPin, Search, Sparkles, Star } from 'lucide-react'
import { CATEGORIES, REGIONS } from './data/listings'
import { generateItinerary } from './services/aiPlanner'
import { fetchListings } from './services/listingService'

function App() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All Areas')
  const [category, setCategory] = useState('all')
  const [groupType, setGroupType] = useState('families')
  const [budget, setBudget] = useState('low')
  const [listings, setListings] = useState([])

  useEffect(() => {
    fetchListings({ query, region, category }).then(setListings)
  }, [query, region, category])

  const itinerary = useMemo(
    () => generateItinerary({ budget, groupType, region }),
    [budget, groupType, region],
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-emerald-300 uppercase text-xs tracking-wide font-semibold">Phase 1</p>
          <h1 className="text-3xl font-bold mt-2">Discover Tri-State AI Foundation</h1>
          <p className="text-slate-300 mt-2">
            Clean architecture + AI-ready metadata + retrieval baseline + itinerary assistant.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-4 grid md:grid-cols-3 gap-3">
            <label className="text-sm">
              <span className="font-semibold block mb-1">Search</span>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
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
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-bold text-lg">Listings ({listings.length})</h2>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {listings.map((listing) => (
                <article key={listing.id} className="border rounded-lg p-3 bg-slate-50">
                  <h3 className="font-semibold">{listing.name}</h3>
                  <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.region}</span>
                  </div>
                  <p className="text-sm mt-2 text-slate-700">{listing.description}</p>
                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" /> {listing.rating}
                    </span>
                    <span>relevance: {listing.relevanceScore}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-xl border p-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600" />
            AI Itinerary Assistant
          </h2>
          <p className="text-sm text-slate-600 mt-1">Phase 1 deterministic planner (agent-ready).</p>

          <div className="mt-4 space-y-3">
            <label className="text-sm block">
              <span className="font-semibold block mb-1">Group</span>
              <select
                value={groupType}
                onChange={(event) => setGroupType(event.target.value)}
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              {itinerary.summary}
            </p>
            <ol className="mt-2 text-sm text-slate-700 space-y-2">
              {itinerary.stops.map((stop) => (
                <li key={stop.order}>
                  <span className="font-semibold">{stop.order}. {stop.name}</span>
                  <p className="text-xs text-slate-600">{stop.reason}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
