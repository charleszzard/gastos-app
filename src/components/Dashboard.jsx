import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { CATEGORIES, MONTHS, getCat } from '../constants'
import TransactionItem from './TransactionItem'

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard({ month, year, onEdit, onAdd, goToTransactions }) {
  const { data } = useApp()

  const filtered = useMemo(() => data.expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === month && d.getFullYear() === year
  }), [data.expenses, month, year])

  const income   = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense  = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance  = income - expense

  const catTotals = useMemo(() => {
    const map = {}
    filtered.filter(e => e.type === 'expense').forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return CATEGORIES.filter(c => map[c.id]).map(c => ({ ...c, value: map[c.id] })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const last6months = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      let m = month - i, y = year
      if (m < 0) { m += 12; y-- }
      const exps = data.expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return d.getMonth() === m && d.getFullYear() === y && e.type === 'expense'
      })
      result.push({ name: MONTHS[m].slice(0, 3), total: exps.reduce((s, e) => s + e.amount, 0) })
    }
    return result
  }, [data.expenses, month, year])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const avgDaily = expense / daysInMonth
  const largest  = filtered.filter(e => e.type === 'expense').sort((a, b) => b.amount - a.amount)[0]

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Balance Hero */}
      <div className="bg-brand-600 rounded-3xl p-5 text-white">
        <p className="text-sm opacity-80 mb-1">Saldo do mês</p>
        <p className="text-4xl font-semibold tracking-tight mb-4">{fmt(balance)}</p>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-xs opacity-70 mb-0.5">↑ Receitas</p>
            <p className="text-base font-semibold">{fmt(income)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-xs opacity-70 mb-0.5">↓ Gastos</p>
            <p className="text-base font-semibold">{fmt(expense)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Gasto médio/dia" value={fmt(avgDaily)} sub={`${filtered.length} lançamentos`} color="text-gray-800 dark:text-gray-100" />
        <StatCard
          label="Maior gasto"
          value={largest ? fmt(largest.amount) : '—'}
          sub={largest ? largest.desc.slice(0, 18) : 'nenhum'}
          color="text-red-500"
        />
      </div>

      {/* Donut chart */}
      {catTotals.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Por categoria</p>
          <div className="flex items-center gap-3">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catTotals} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={2}>
                    {catTotals.map(c => <Cell key={c.id} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {catTotals.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{c.name}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart last 6 months */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Evolução (6 meses)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={last6months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} />
            <Bar dataKey="total" fill="#1d9e75" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Últimos lançamentos</p>
          {filtered.length > 4 && (
            <button onClick={goToTransactions} className="text-xs text-brand-600 dark:text-brand-400">Ver todos</button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm">Nenhum lançamento este mês.</p>
            <button onClick={onAdd} className="mt-3 text-sm text-brand-600 dark:text-brand-400 underline">Adicionar agora</button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 5).map(e => <TransactionItem key={e.id} expense={e} onEdit={onEdit} />)}
          </div>
        )}
      </div>
    </div>
  )
}
