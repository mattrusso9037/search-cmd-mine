import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { commands } from './data/commands'
import { Search, Filter, Copy, Check, ChevronDown, Sparkles } from 'lucide-react'

function useFuse(data) {
  return useMemo(() => new Fuse(data, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'aliases', weight: 0.2 },
      { name: 'description', weight: 0.2 },
      { name: 'syntax', weight: 0.2 },
      { name: 'tags', weight: 0.2 },
      { name: 'examples', weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  }), [data])
}

const CATEGORIES = [
  'Player',
  'World',
  'Server/Admin',
  'Communication',
  'Entities',
  'Items/Blocks',
  'Scoreboard/Data',
  'Utility',
]

function Badge({ children }) {
  return <span className="chip">{children}</span>
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-slate-500">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={`btn-ghost ${copied ? 'text-green-700 border-green-300' : ''}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch (e) {}
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function CommandCard({ cmd }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">/{cmd.name}</h3>
            <div className="hidden md:flex gap-2 flex-wrap">
              {cmd.tags?.slice(0,4).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-3">{cmd.description}</p>

          <div className="space-y-2">
            <SectionTitle icon={Sparkles}>How to use</SectionTitle>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-slate-900/90 text-slate-100 px-3 py-2 text-sm">/{cmd.syntax}</code>
              <CopyButton text={`/${cmd.syntax}`} />
            </div>

            {cmd.examples?.length ? (
              <div className="space-y-1">
                <SectionTitle icon={ChevronDown}>Examples</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {cmd.examples.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <code className="rounded-lg bg-slate-800 text-slate-100 px-2 py-1 text-sm">/{e}</code>
                      <CopyButton text={`/${e}`} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="md:w-48 flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap md:hidden">
            {cmd.tags?.slice(0,6).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          {cmd.permission ? (
            <div className="text-sm text-slate-500">Requires: <span className="font-semibold text-slate-700 dark:text-slate-200">{cmd.permission}</span></div>
          ) : null}
          {cmd.aliases?.length ? (
            <div className="text-sm text-slate-500">Also: <span className="text-slate-700 dark:text-slate-200">{cmd.aliases.join(', ')}</span></div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [activeCats, setActiveCats] = useState(new Set())
  const [onlyKidsFriendly, setOnlyKidsFriendly] = useState(true)
  const fuse = useFuse(commands)

  const results = useMemo(() => {
    let pool = commands
    if (activeCats.size) {
      pool = pool.filter(c => c.category && activeCats.has(c.category))
    }
    if (onlyKidsFriendly) {
      pool = pool.filter(c => !c.adminOnly)
    }
    if (!query.trim()) return pool
    const hits = fuse.search(query.trim(), { limit: 200 })
    return hits.map(h => h.item)
  }, [query, activeCats, onlyKidsFriendly, fuse])

  const toggleCat = (c) => {
    const next = new Set(activeCats)
    if (next.has(c)) next.delete(c)
    else next.add(c)
    setActiveCats(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200/30 via-sky-200/30 to-white dark:to-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          {/* <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-sky-400 shadow-lg" /> */}
          <img src="/logo.png" alt="Minecraft Commands Explorer" className="h-30 w-20" />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Minecraft Commands Explorer</h1>
            <p className="text-sm text-slate-500">Find commands fast with fuzzy search and filters</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-6">
        {/* Hero image above search */}
        <section className="card p-0 overflow-hidden">
          <div className="relative">
            <img
              src="/mcraft-sunset.png"
              alt="Minecraft landscape hero"
              className="w-full h-48 md:h-64 object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-3 left-4 md:bottom-4 md:left-5">
              <h2 className="text-white text-lg md:text-2xl font-extrabold drop-shadow">Find Any Minecraft Command</h2>
              <p className="text-white/90 text-sm md:text-base">Fuzzy search + kid-friendly filters</p>
            </div>
          </div>
        </section>

        <div className="card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <Search className="h-5 w-5 text-sky-700" />
            <div className="font-semibold text-sky-800">Search</div>
          </div>
          <input
            className="input"
            placeholder="Search commands (try: teleport, tp, weather, give)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Quick filters:</span>
            </div>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`chip ${activeCats.has(c) ? 'bg-pink-500 text-white border-pink-400' : ''}`}
              >
                {c}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={onlyKidsFriendly} onChange={(e)=>setOnlyKidsFriendly(e.target.checked)} />
                Hide server-only commands
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Showing <span className="font-semibold">{results.length}</span> of {commands.length} commands
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {results.map((cmd) => (
            <CommandCard key={cmd.name} cmd={cmd} />
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
