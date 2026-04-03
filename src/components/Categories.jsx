import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Categories({ month, year }) {
  const { data, setBudget } = useApp()
  const [editBudget, setEditBudget] = useState(null) // category id
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
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      {totalBudget > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Orçamento geral</p>
            <p className="text-xs text-gray-400">{fmt(totalSpent)} / {fmt(totalBudget)}</p>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                background: totalSpent > totalBudget ? '#e24b4a' : '#1d9e75'
              }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            {totalBudget > totalSpent
              ? `${fmt(totalBudget - totalSpent)} disponíveis`
              : `${fmt(totalSpent - totalBudget)} acima do orçamento`}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Toque em ✏️ para definir um orçamento por categoria</p>

      {/* Category cards */}
      <div className="space-y-3">
        {catTotals.map(c => {
          const pct     = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0
          const over    = c.budget > 0 && c.spent > c.budget
          const barColor = over ? '#e24b4a' : c.color

          return (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: c.bg }}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{c.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {fmt(c.spent)}
                    {c.budget > 0 && <span> / {fmt(c.budget)}{over && <span className="text-red-400"> ⚠️</span>}</span>}
                  </p>
                </div>
                <button
                  onClick={() => { setEditBudget(c.id); setBudgetInput(c.budget > 0 ? c.budget.toString() : '') }}
                  className="text-base text-gray-300 dark:text-gray-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >✏️</button>
              </div>

              {c.budget > 0 && (
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              )}

              {/* Budget edit inline */}
              {editBudget === c.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    autoFocus
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    placeholder="Orçamento (R$)"
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-400"
                  />
                  <button onClick={() => saveBudget(c.id)} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium">OK</button>
                  <button onClick={() => setEditBudget(null)} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm">✕</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
