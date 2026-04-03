import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'
import TransactionItem from './TransactionItem'
import { exportCSV } from '../db'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', green: '#50fa7b', red: '#ff5555',
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

export default function Transactions({ month, year, onEdit }) {
  const { data } = useApp()
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [catFilter, setCatFilter] = useState('all')

  const filtered = useMemo(() => {
    return data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      if (d.getMonth() !== month || d.getFullYear() !== year) return false
      if (filter !== 'all' && e.type !== filter) return false
      if (catFilter !== 'all' && e.category !== catFilter) return false
      if (search && !e.desc.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data.expenses, month, year, search, filter, catFilter])

  const total = filtered.reduce((s, e) => e.type === 'expense' ? s - e.amount : s + e.amount, 0)

  return (
    <div className="px-4 py-4 space-y-4 slide-up">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: D.comment }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar lançamento..."
          style={{ ...INPUT_STYLE, paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { v: 'all',     l: 'Todos' },
          { v: 'expense', l: '↓ Gastos' },
          { v: 'income',  l: '↑ Receitas' },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: filter === v ? D.purple : 'rgba(68,71,90,0.5)',
              color: filter === v ? D.bg : D.comment,
              border: filter === v ? `1px solid ${D.purple}` : '1px solid rgba(98,114,164,0.25)',
              boxShadow: filter === v ? `0 0 10px rgba(189,147,249,0.3)` : 'none',
            }}
          >{l}</button>
        ))}

        <div className="w-px flex-shrink-0" style={{ background: 'rgba(98,114,164,0.2)' }} />

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

      {/* Summary + export */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs" style={{ color: D.comment }}>{filtered.length} lançamentos · </span>
          <span
            className="text-xs font-semibold"
            style={{
              color: total >= 0 ? D.green : D.red,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {total >= 0 ? '+' : ''}{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95"
          style={{
            background: 'rgba(68,71,90,0.5)',
            color: D.comment,
            border: '1px solid rgba(98,114,164,0.25)',
          }}
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: D.comment }}>Nenhum lançamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => <TransactionItem key={e.id} expense={e} onEdit={onEdit} />)}
        </div>
      )}
    </div>
  )
}
