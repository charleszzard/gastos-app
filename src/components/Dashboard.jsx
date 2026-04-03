import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { CATEGORIES, MONTHS, getCat } from '../constants'
import TransactionItem from './TransactionItem'

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm shadow-violet-50 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
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
  const balancePositive = balance >= 0

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Balance Hero */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)' }}>
        {/* decorative circle */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <p className="text-xs font-medium opacity-75 mb-1 tracking-wide uppercase">Saldo do mês</p>
        <p className={`text-4xl font-bold tracking-tight mb-4 ${balancePositive ? 'text-white' : 'text-red-200'}`}>
          {fmt(balance)}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-[11px] opacity-70 mb-0.5 flex items-center gap-1">
              <span className="text-green-300">↑</span> Receitas
            </p>
            <p className="text-base font-bold">{fmt(income)}</p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-[11px] opacity-70 mb-0.5 flex items-center gap-1">
              <span className="text-red-300">↓</span> Gastos
            </p>
            <p className="text-base font-bold">{fmt(expense)}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="📅"
          label="Gasto médio/dia"
          value={fmt(isNaN(avgDaily) ? 0 : avgDaily)}
          sub={`${filtered.length} lançamento${filtered.length !== 1 ? 's' : ''}`}
          color="text-violet-700"
        />
        <StatCard
          icon="🔺"
          label="Maior gasto"
          value={largest ? fmt(largest.amount) : '—'}
          sub={largest ? largest.desc.slice(0, 18) : 'nenhum'}
          color="text-red-500"
        />
      </div>

      {/* Donut chart */}
      {catTotals.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm shadow-violet-50">
          <p className="text-sm font-semibold text-gray-700 mb-3">Por categoria</p>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catTotals} dataKey="value" cx="50%" cy="50%" innerRadius={33} outerRadius={52} paddingAngle={3}>
                    {catTotals.map(c => <Cell key={c.id} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {catTotals.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-gray-500 flex-1">{c.name}</span>
                  <span className="text-xs font-semibold text-gray-700">{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart last 6 months */}
      <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm shadow-violet-50">
        <p className="text-sm font-semibold text-gray-700 mb-3">Evolução (6 meses)</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={last6months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} cursor={{ fill: '#f3e8ff' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {last6months.map((_, i) => (
                <Cell key={i} fill={i === last6months.length - 1 ? '#7c3aed' : '#c4b5fd'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Últimos lançamentos</p>
          {filtered.length > 4 && (
            <button onClick={goToTransactions} className="text-xs text-brand-600 font-medium py-1 px-2 rounded-lg bg-brand-50">Ver todos</button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-sm font-medium">Nenhum lançamento este mês.</p>
            <button onClick={onAdd} className="mt-4 text-sm text-brand-600 font-semibold py-2 px-5 rounded-2xl bg-brand-50 border border-brand-200">
              Adicionar agora
            </button>
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
