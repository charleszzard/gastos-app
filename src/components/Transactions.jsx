import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'
import TransactionItem from './TransactionItem'
import { exportCSV } from '../db'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', green: '#50fa7b', red: '#ff5555',
  orange: '#ffb86c', cyan: '#8be9fd',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const INPUT_STYLE = {
  background: 'rgba(40,42,54,0.8)',
  border: '1px solid rgba(98,114,164,0.3)',
  borderRadius: 14,
  padding: '12px 16px',
  color: D.fg,
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
}

function DateGroupHeader({ label, items }) {
  const total = items.reduce((s, e) => s + e.amount, 0)
  return (
    <div className="flex items-center justify-between pt-2 pb-1 px-1">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: D.comment }}>{label}</span>
      <span className="text-xs" style={{ color: D.comment }}>
        {items.length} gasto{items.length !== 1 ? 's' : ''} ·{' '}
        <span style={{ color: D.red, fontFamily: "'JetBrains Mono', monospace" }}>−{fmt(total)}</span>
      </span>
    </div>
  )
}

function groupByDate(items) {
  const today     = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const todayStr     = today.toISOString().split('T')[0]
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const groups = {}
  items.forEach(e => {
    let label
    if (e.date === todayStr)          label = 'Hoje'
    else if (e.date === yesterdayStr) label = 'Ontem'
    else {
      const d = new Date(e.date + 'T00:00:00')
      label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    }
    if (!groups[label]) groups[label] = { order: e.date, items: [] }
    groups[label].items.push(e)
  })

  return Object.entries(groups)
    .sort(([, a], [, b]) => b.order.localeCompare(a.order))
    .map(([label, { items }]) => ({
      label,
      items: items.sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

export default function Transactions({ month, year, onEdit }) {
  const { data } = useApp()
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const filtered = useMemo(() => {
    return data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      if (d.getMonth() !== month || d.getFullYear() !== year) return false
      if (e.type !== 'expense') return false
      if (catFilter !== 'all' && e.category !== catFilter) return false
      if (search && !e.desc.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [data.expenses, month, year, search, catFilter])

  const total  = filtered.reduce((s, e) => s + e.amount, 0)
  const groups = useMemo(() => groupByDate(filtered), [filtered])

  // top category
  const topCat = useMemo(() => {
    const map = {}
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
    if (!sorted.length) return null
    const cat = CATEGORIES.find(c => c.id === sorted[0][0])
    return cat ? { ...cat, amount: sorted[0][1] } : null
  }, [filtered])

  return (
    <div className="px-4 py-4 space-y-4 slide-up">

      {/* Hero card */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3a1a1a 0%, #3a2a2a 50%, #3a1a1a 100%)',
          border: '1px solid rgba(255,85,85,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,85,85,0.06)' }} />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,121,198,0.05)' }} />

        <p className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'rgba(255,85,85,0.7)' }}>
          🧾 Gastos do mês
        </p>
        <p
          className="text-4xl font-black tracking-tight mb-4"
          style={{
            color: D.red,
            textShadow: `0 0 24px rgba(255,85,85,0.4)`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          −{fmt(total)}
        </p>

        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.15)' }}>
            <p className="text-[11px] mb-0.5" style={{ color: 'rgba(255,85,85,0.6)' }}>Total de registros</p>
            <p className="text-base font-bold" style={{ color: D.fg }}>{filtered.length}</p>
          </div>
          {topCat && (
            <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.15)' }}>
              <p className="text-[11px] mb-0.5 truncate" style={{ color: 'rgba(255,85,85,0.6)' }}>Maior categoria</p>
              <p className="text-base font-bold flex items-center gap-1.5" style={{ color: D.fg }}>
                <span>{topCat.icon}</span>
                <span className="text-sm truncate">{topCat.name.split(' ')[0]}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setCatFilter('all')}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
          style={{
            background: catFilter === 'all' ? D.red : 'rgba(68,71,90,0.5)',
            color: catFilter === 'all' ? '#fff' : D.comment,
            border: catFilter === 'all' ? `1px solid ${D.red}` : '1px solid rgba(98,114,164,0.25)',
            boxShadow: catFilter === 'all' ? `0 0 10px rgba(255,85,85,0.3)` : 'none',
          }}
        >Todos</button>

        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCatFilter(cat => cat === c.id ? 'all' : c.id)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: catFilter === c.id ? `${c.color}22` : 'rgba(68,71,90,0.5)',
              color: catFilter === c.id ? c.color : D.comment,
              border: catFilter === c.id ? `1px solid ${c.color}60` : '1px solid rgba(98,114,164,0.25)',
            }}
          >
            {c.icon} {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: D.comment }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar gasto..."
          style={{ ...INPUT_STYLE, paddingLeft: '2.5rem' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs"
            style={{ background: 'rgba(98,114,164,0.3)', color: D.comment }}
          >✕</button>
        )}
      </div>

      {/* Count + export */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs" style={{ color: D.comment }}>
          {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
          {catFilter !== 'all' && ' nessa categoria'}
        </span>
        <button
          onClick={() => exportCSV(filtered)}
          className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95"
          style={{
            background: 'rgba(68,71,90,0.5)',
            color: D.comment,
            border: '1px solid rgba(98,114,164,0.25)',
          }}
        >
          📥 CSV
        </button>
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-sm" style={{ color: D.comment }}>
            {catFilter !== 'all' ? 'Nenhum gasto nessa categoria.' : 'Nenhum gasto registrado este mês.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {groups.map(group => (
            <div key={group.label}>
              <DateGroupHeader label={group.label} items={group.items} />
              <div className="space-y-2">
                {group.items.map(e => (
                  <TransactionItem key={e.id} expense={e} onEdit={onEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
