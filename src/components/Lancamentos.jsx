import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'
import TransactionItem from './TransactionItem'
import { exportCSV } from '../db'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', green: '#50fa7b',
  red: '#ff5555', cyan: '#8be9fd', orange: '#ffb86c',
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
  const incomeTotal  = items.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expenseTotal = items.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const net = incomeTotal - expenseTotal

  return (
    <div className="flex items-center justify-between pt-2 pb-1 px-1">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: D.comment }}>{label}</span>
      <span className="text-xs flex items-center gap-2" style={{ color: D.comment }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
        {incomeTotal > 0 && (
          <span style={{ color: D.green, fontFamily: "'JetBrains Mono', monospace" }}>+{fmt(incomeTotal)}</span>
        )}
        {expenseTotal > 0 && (
          <span style={{ color: D.red, fontFamily: "'JetBrains Mono', monospace" }}>−{fmt(expenseTotal)}</span>
        )}
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

export default function Lancamentos({ month, year, onEdit }) {
  const { data } = useApp()
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'expense' | 'income'

  const filtered = useMemo(() => {
    return data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      if (d.getMonth() !== month || d.getFullYear() !== year) return false
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (search && !e.desc.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [data.expenses, month, year, search, typeFilter])

  const totalIncome  = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance      = totalIncome - totalExpense

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const TYPE_FILTERS = [
    { key: 'all',     label: 'Todos',    icon: '📋' },
    { key: 'expense', label: 'Gastos',   icon: '↓' },
    { key: 'income',  label: 'Receitas', icon: '↑' },
  ]

  return (
    <div className="px-4 py-4 space-y-4 slide-up">

      {/* Hero summary card */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2a2a4a 0%, #373948 50%, #2d2a4a 100%)',
          border: '1px solid rgba(189,147,249,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(189,147,249,0.06)' }} />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,121,198,0.05)' }} />

        <p className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'rgba(189,147,249,0.7)' }}>
          📋 Extrato do mês
        </p>

        {/* Saldo líquido */}
        <p
          className="text-4xl font-black tracking-tight mb-4"
          style={{
            color: balance >= 0 ? D.green : D.red,
            textShadow: `0 0 24px ${balance >= 0 ? D.green : D.red}50`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {balance >= 0 ? '+' : ''}{fmt(balance)}
        </p>

        {/* Receitas e gastos lado a lado */}
        <div className="flex gap-3">
          <div
            className="flex-1 rounded-2xl p-3"
            style={{ background: 'rgba(80,250,123,0.08)', border: '1px solid rgba(80,250,123,0.18)' }}
          >
            <p className="text-[11px] mb-0.5 flex items-center gap-1" style={{ color: 'rgba(80,250,123,0.7)' }}>
              <span>↑</span> Receitas
            </p>
            <p className="text-base font-bold" style={{ color: D.green, fontFamily: "'JetBrains Mono', monospace" }}>
              {fmt(totalIncome)}
            </p>
          </div>
          <div
            className="flex-1 rounded-2xl p-3"
            style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.18)' }}
          >
            <p className="text-[11px] mb-0.5 flex items-center gap-1" style={{ color: 'rgba(255,85,85,0.7)' }}>
              <span>↓</span> Gastos
            </p>
            <p className="text-base font-bold" style={{ color: D.red, fontFamily: "'JetBrains Mono', monospace" }}>
              {fmt(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros de tipo (Todos / Gastos / Receitas) */}
      <div className="flex gap-2">
        {TYPE_FILTERS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className="flex-1 text-xs py-2.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-1"
            style={{
              background: typeFilter === key
                ? key === 'expense' ? 'rgba(255,85,85,0.18)'
                  : key === 'income' ? 'rgba(80,250,123,0.18)'
                  : 'rgba(189,147,249,0.18)'
                : 'rgba(68,71,90,0.4)',
              color: typeFilter === key
                ? key === 'expense' ? D.red
                  : key === 'income' ? D.green
                  : D.purple
                : D.comment,
              border: typeFilter === key
                ? key === 'expense' ? '1px solid rgba(255,85,85,0.4)'
                  : key === 'income' ? '1px solid rgba(80,250,123,0.4)'
                  : `1px solid rgba(189,147,249,0.4)`
                : '1px solid rgba(98,114,164,0.2)',
              boxShadow: typeFilter === key
                ? key === 'expense' ? '0 0 12px rgba(255,85,85,0.15)'
                  : key === 'income' ? '0 0 12px rgba(80,250,123,0.15)'
                  : '0 0 12px rgba(189,147,249,0.15)'
                : 'none',
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: D.comment }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar lançamento..."
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
          {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
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
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm" style={{ color: D.comment }}>
            {search ? 'Nenhum lançamento encontrado.' : 'Nenhum lançamento registrado este mês.'}
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
