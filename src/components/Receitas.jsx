import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, INCOME_CATEGORIES, MONTHS, getCat } from '../constants'
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

function DateGroupHeader({ label, count, total }) {
  return (
    <div className="flex items-center justify-between pt-2 pb-1 px-1">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: D.comment }}>{label}</span>
      <span className="text-xs" style={{ color: D.comment }}>
        {count} item{count !== 1 ? 's' : ''} ·{' '}
        <span style={{ color: D.green, fontFamily: "'JetBrains Mono', monospace" }}>
          +{fmt(total)}
        </span>
      </span>
    </div>
  )
}

function groupByDate(expenses) {
  const today     = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const todayStr     = today.toISOString().split('T')[0]
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const groups = {}
  expenses.forEach(e => {
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
      total: items.reduce((s, e) => s + e.amount, 0),
    }))
}

export default function Receitas({ month, year, onEdit, onAdd }) {
  const { data } = useApp()
  const [search, setSearch] = useState('')

  const allIncome = useMemo(() => {
    return data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      if (d.getMonth() !== month || d.getFullYear() !== year) return false
      if (e.type !== 'income') return false
      if (search && !e.desc.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data.expenses, month, year, search])

  const totalIncome = allIncome.reduce((s, e) => s + e.amount, 0)

  // Breakdown by "category" source grouping (by description prefix or category)
  const byCategory = useMemo(() => {
    const map = {}
    allIncome.forEach(e => {
      const key = e.category || 'income_other'
      map[key] = (map[key] || 0) + e.amount
    })
    const customCategories = data.customCategories || []
    return Object.entries(map)
      .map(([catId, total]) => {
        const cat = getCat(catId, 'income', customCategories)
        return { catId, total, name: cat?.name || 'Outros', icon: cat?.icon || '💰', color: cat?.color || D.green }
      })
      .sort((a, b) => b.total - a.total)
  }, [allIncome, data.customCategories])

  const groups = useMemo(() => groupByDate(allIncome), [allIncome])

  const prevMonthIncome = useMemo(() => {
    let m = month - 1, y = year
    if (m < 0) { m = 11; y-- }
    return data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === m && d.getFullYear() === y && e.type === 'income'
    }).reduce((s, e) => s + e.amount, 0)
  }, [data.expenses, month, year])

  const diff = totalIncome - prevMonthIncome
  const diffPct = prevMonthIncome > 0 ? ((diff / prevMonthIncome) * 100).toFixed(1) : null

  return (
    <div className="px-4 py-4 space-y-4 slide-up">

      {/* Hero card */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a4a2e 0%, #2a4a3a 50%, #1e3d2f 100%)',
          border: '1px solid rgba(80,250,123,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(80,250,123,0.07)' }} />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(80,250,123,0.05)' }} />

        <p className="text-xs font-semibold mb-1 tracking-widest uppercase"
          style={{ color: 'rgba(80,250,123,0.7)' }}>
          💰 Receitas de {MONTHS[month]}
        </p>
        <p
          className="text-4xl font-black tracking-tight mb-1"
          style={{
            color: D.green,
            textShadow: `0 0 24px rgba(80,250,123,0.5)`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {fmt(totalIncome)}
        </p>

        {/* Comparação com mês anterior */}
        {prevMonthIncome > 0 && (
          <p className="text-xs mb-4" style={{ color: 'rgba(80,250,123,0.6)' }}>
            {diff >= 0 ? '▲' : '▼'}{' '}
            <span style={{ color: diff >= 0 ? D.green : D.red }}>
              {fmt(Math.abs(diff))} ({diffPct}%)
            </span>{' '}
            vs mês anterior
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onAdd}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{
              background: 'rgba(80,250,123,0.15)',
              color: D.green,
              border: '1px solid rgba(80,250,123,0.3)',
            }}
          >
            <span className="text-sm">+</span> Adicionar receita
          </button>
          <button
            onClick={() => exportCSV(allIncome)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            style={{
              background: 'rgba(98,114,164,0.2)',
              color: D.comment,
              border: '1px solid rgba(98,114,164,0.25)',
            }}
          >
            📥 CSV
          </button>
        </div>
      </div>

      {/* Breakdown por fonte — só aparece se houver mais de 1 categoria */}
      {byCategory.length > 1 && (
        <div
          className="p-4 rounded-2xl"
          style={{ background: D.surface2, border: '1px solid rgba(98,114,164,0.2)' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: D.fg }}>Origens</p>
          <div className="space-y-2.5">
            {byCategory.map(({ catId, name, icon, color, total }) => {
              const pct = totalIncome > 0 ? (total / totalIncome) * 100 : 0
              return (
                <div key={catId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs flex items-center gap-1.5" style={{ color: D.comment }}>
                      <span>{icon}</span> {name}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: D.green, fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(total)} <span style={{ color: D.comment }}>· {pct.toFixed(0)}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(98,114,164,0.2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: D.green, boxShadow: `0 0 8px rgba(80,250,123,0.4)` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: D.comment }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar receita..."
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

      {/* Count */}
      <p className="text-xs px-1" style={{ color: D.comment }}>
        {allIncome.length} receita{allIncome.length !== 1 ? 's' : ''} este mês
      </p>

      {/* Grouped list */}
      {allIncome.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-5xl mb-3">💰</p>
          <p className="text-sm font-medium" style={{ color: D.comment }}>
            {search ? 'Nenhuma receita encontrada.' : 'Nenhuma receita registrada este mês.'}
          </p>
          {!search && (
            <button
              onClick={onAdd}
              className="mt-4 text-sm font-bold py-2.5 px-6 rounded-2xl transition-all active:scale-95"
              style={{ background: 'rgba(80,250,123,0.12)', color: D.green, border: `1px solid rgba(80,250,123,0.25)` }}
            >
              Registrar receita
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {groups.map(group => (
            <div key={group.label}>
              <DateGroupHeader label={group.label} count={group.items.length} total={group.total} />
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
