import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'
import TransactionItem from './TransactionItem'
import { exportCSV } from '../db'

export default function Transactions({ month, year, onEdit }) {
  const { data } = useApp()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all') // all | expense | income
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
    <div className="px-4 py-4 space-y-4">
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Buscar lançamento..."
        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-brand-400"
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['all', 'expense', 'income'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'expense' ? '↓ Gastos' : '↑ Receitas'}
          </button>
        ))}
        <div className="w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCatFilter(cat => cat === c.id ? 'all' : c.id)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              catFilter === c.id ? 'text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
            style={catFilter === c.id ? { background: c.color } : {}}
          >
            {c.icon} {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Summary + export */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} lançamentos · </span>
          <span className={`text-xs font-medium ${total >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            {total >= 0 ? '+' : ''}{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">Nenhum lançamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => <TransactionItem key={e.id} expense={e} onEdit={onEdit} />)}
        </div>
      )}
    </div>
  )
}
