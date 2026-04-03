import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', green: '#50fa7b', red: '#ff5555',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Categories({ month, year }) {
  const { data, setBudget } = useApp()
  const [editBudget, setEditBudget] = useState(null)
  const [budgetInput, setBudgetInput] = useState('')

  const catTotals = useMemo(() => {
    const map = {}
    data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === month && d.getFullYear() === year && e.type === 'expense'
    }).forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return CATEGORIES.map(c => ({
      ...c,
      spent: map[c.id] || 0,
      budget: data.budgets[c.id] || 0,
    })).sort((a, b) => b.spent - a.spent)
  }, [data.expenses, data.budgets, month, year])

  const totalSpent  = catTotals.reduce((s, c) => s + c.spent, 0)
  const totalBudget = catTotals.reduce((s, c) => s + c.budget, 0)

  const saveBudget = (catId) => {
    const val = parseFloat(budgetInput.replace(',', '.'))
    if (!isNaN(val) && val >= 0) setBudget(catId, val)
    setEditBudget(null)
  }

  return (
    <div className="px-4 py-4 space-y-4 slide-up">
      {/* Overall budget summary */}
      {totalBudget > 0 && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: D.surface2,
            border: '1px solid rgba(98,114,164,0.25)',
          }}
        >
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-semibold" style={{ color: D.fg }}>Orçamento geral</p>
            <p
              className="text-xs font-mono"
              style={{ color: D.comment, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fmt(totalSpent)} / {fmt(totalBudget)}
            </p>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(98,114,164,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                background: totalSpent > totalBudget ? D.red : D.green,
                boxShadow: `0 0 10px ${totalSpent > totalBudget ? D.red : D.green}60`,
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: D.comment }}>
            {totalBudget > totalSpent
              ? `${fmt(totalBudget - totalSpent)} disponíveis`
              : `${fmt(totalSpent - totalBudget)} acima do orçamento`}
          </p>
        </div>
      )}

      <p className="text-xs text-center" style={{ color: D.comment }}>
        Toque em ✏️ para definir um orçamento por categoria
      </p>

      {/* Category cards */}
      <div className="space-y-3">
        {catTotals.map(c => {
          const pct      = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0
          const over     = c.budget > 0 && c.spent > c.budget
          const barColor = over ? D.red : c.color

          return (
            <div
              key={c.id}
              className="p-4 rounded-2xl transition-all"
              style={{
                background: D.surface2,
                border: over
                  ? '1px solid rgba(255,85,85,0.25)'
                  : '1px solid rgba(98,114,164,0.2)',
                boxShadow: over ? '0 4px 16px rgba(255,85,85,0.1)' : 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${c.color}20`, border: `1px solid ${c.color}25` }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: D.fg }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: D.comment, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(c.spent)}
                    {c.budget > 0 && (
                      <span> / {fmt(c.budget)}{over && <span style={{ color: D.red }}> ⚠️</span>}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { setEditBudget(c.id); setBudgetInput(c.budget > 0 ? c.budget.toString() : '') }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                  style={{ color: D.comment, background: 'rgba(98,114,164,0.12)' }}
                >✏️</button>
              </div>

              {c.budget > 0 && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(98,114,164,0.2)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}60` }}
                  />
                </div>
              )}

              {editBudget === c.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    autoFocus
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveBudget(c.id)}
                    placeholder="Orçamento (R$)"
                    style={{
                      flex: 1,
                      background: 'rgba(40,42,54,0.8)',
                      border: `1px solid rgba(189,147,249,0.4)`,
                      borderRadius: 12,
                      padding: '8px 12px',
                      color: D.fg,
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => saveBudget(c.id)}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={{ background: D.purple, color: D.bg }}
                  >OK</button>
                  <button
                    onClick={() => setEditBudget(null)}
                    className="px-3 py-2 rounded-xl text-sm transition-all"
                    style={{ background: 'rgba(98,114,164,0.2)', color: D.comment }}
                  >✕</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
