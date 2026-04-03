import React, { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { CATEGORIES, MONTHS, getCat } from '../constants'
import TransactionItem from './TransactionItem'
import DueBillsBanner from './DueBillsBanner'

// Dracula palette
const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', cyan: '#8be9fd',
  green: '#50fa7b', red: '#ff5555', orange: '#ffb86c', yellow: '#f1fa8c',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CARD_STYLE = {
  background: D.surface2,
  border: '1px solid rgba(98,114,164,0.25)',
  borderRadius: 18,
}

function StatCard({ label, value, sub, color, icon, glow }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl" style={CARD_STYLE}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <p className="text-xs font-medium" style={{ color: D.comment }}>{label}</p>
      </div>
      <p className="text-xl font-bold" style={{ color, textShadow: glow ? `0 0 16px ${color}80` : 'none' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: D.comment }}>{sub}</p>}
    </div>
  )
}

function SavingsGoalCard({ income, expense, savingsGoal, onSetGoal }) {
  const [editing, setEditing] = useState(false)
  const [goalInput, setGoalInput] = useState(String(savingsGoal || ''))
  const saved = income - expense
  const pct = savingsGoal > 0 ? Math.min(100, Math.max(0, (saved / savingsGoal) * 100)) : 0
  const exceeded = saved >= savingsGoal && savingsGoal > 0

  const handleSave = () => {
    const val = parseFloat(goalInput.replace(',', '.'))
    if (!isNaN(val) && val >= 0) onSetGoal(val)
    setEditing(false)
  }

  const barColor = exceeded ? D.green : pct > 60 ? D.purple : pct > 30 ? D.orange : D.red

  return (
    <div className="p-4 rounded-2xl" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <p className="text-sm font-semibold" style={{ color: D.fg }}>Meta de economia</p>
        </div>
        <button
          onClick={() => { setGoalInput(String(savingsGoal || '')); setEditing(e => !e) }}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ background: 'rgba(189,147,249,0.15)', color: D.purple }}
        >
          {editing ? 'Cancelar' : savingsGoal > 0 ? 'Editar' : 'Definir'}
        </button>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="number"
            step="0.01"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Meta em R$"
            className="drac-input flex-1 text-sm font-bold"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: D.purple, color: D.bg }}
          >OK</button>
        </div>
      ) : savingsGoal > 0 ? (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="font-bold" style={{ color: exceeded ? D.green : saved > 0 ? D.purple : D.red }}>
              {fmt(Math.max(0, saved))} economizados
            </span>
            <span style={{ color: D.comment }}>meta: {fmt(savingsGoal)}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(98,114,164,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: barColor,
                boxShadow: `0 0 10px ${barColor}60`,
              }}
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: D.comment }}>
            {exceeded
              ? `🎉 Meta atingida! ${fmt(saved - savingsGoal)} acima`
              : saved > 0
                ? `Falta ${fmt(savingsGoal - saved)} · ${pct.toFixed(0)}%`
                : 'Sem saldo positivo este mês'}
          </p>
        </>
      ) : (
        <p className="text-xs" style={{ color: D.comment }}>
          Defina uma meta de economia para acompanhar seu progresso.
        </p>
      )}
    </div>
  )
}

export default function Dashboard({ month, year, onEdit, onAdd, goToTransactions, goToBills }) {
  const { data, setSavingsGoal } = useApp()

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
  const avgDaily    = expense / daysInMonth
  const largest     = filtered.filter(e => e.type === 'expense').sort((a, b) => b.amount - a.amount)[0]
  const balancePositive = balance >= 0

  const TOOLTIP_STYLE = {
    backgroundColor: D.surface,
    border: `1px solid rgba(98,114,164,0.3)`,
    borderRadius: 12,
    fontSize: 12,
    color: D.fg,
  }

  return (
    <div className="px-4 py-4 space-y-4 slide-up">
      {/* Due Bills Banner */}
      <DueBillsBanner goToBills={goToBills} />

      {/* Balance Hero */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3a2f6e 0%, #44475a 50%, #3d2a5e 100%)',
          border: '1px solid rgba(189,147,249,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(189,147,249,0.08)' }} />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'rgba(255,121,198,0.08)' }} />

        <p className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'rgba(189,147,249,0.7)' }}>
          Saldo do mês
        </p>
        <p
          className="text-4xl font-black tracking-tight mb-4"
          style={{
            color: balancePositive ? D.green : D.red,
            textShadow: `0 0 24px ${balancePositive ? D.green : D.red}60`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {fmt(balance)}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(80,250,123,0.08)', border: '1px solid rgba(80,250,123,0.15)' }}>
            <p className="text-[11px] mb-0.5 flex items-center gap-1" style={{ color: 'rgba(80,250,123,0.7)' }}>
              <span>↑</span> Receitas
            </p>
            <p className="text-base font-bold" style={{ color: D.green }}>{fmt(income)}</p>
          </div>
          <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.15)' }}>
            <p className="text-[11px] mb-0.5 flex items-center gap-1" style={{ color: 'rgba(255,85,85,0.7)' }}>
              <span>↓</span> Gastos
            </p>
            <p className="text-base font-bold" style={{ color: D.red }}>{fmt(expense)}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="📅" label="Gasto médio/dia"
          value={fmt(isNaN(avgDaily) ? 0 : avgDaily)}
          sub={`${filtered.length} lançamento${filtered.length !== 1 ? 's' : ''}`}
          color={D.cyan} glow
        />
        <StatCard
          icon="🔺" label="Maior gasto"
          value={largest ? fmt(largest.amount) : '—'}
          sub={largest ? largest.desc.slice(0, 18) : 'nenhum'}
          color={D.orange} glow
        />
      </div>

      {/* Savings Goal */}
      <SavingsGoalCard
        income={income} expense={expense}
        savingsGoal={data.savingsGoal || 0}
        onSetGoal={setSavingsGoal}
      />

      {/* Category Donut */}
      {catTotals.length > 0 && (
        <div className="p-4 rounded-2xl" style={CARD_STYLE}>
          <p className="text-sm font-semibold mb-3" style={{ color: D.fg }}>Por categoria</p>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catTotals} dataKey="value" cx="50%" cy="50%" innerRadius={33} outerRadius={52} paddingAngle={3}>
                    {catTotals.map(c => <Cell key={c.id} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {catTotals.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs flex-1" style={{ color: D.comment }}>{c.name}</span>
                  <span className="text-xs font-semibold" style={{ color: D.fg }}>{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart 6 months */}
      <div className="p-4 rounded-2xl" style={CARD_STYLE}>
        <p className="text-sm font-semibold mb-3" style={{ color: D.fg }}>Evolução (6 meses)</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={last6months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(98,114,164,0.15)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: D.comment }} />
            <YAxis tick={{ fontSize: 10, fill: D.comment }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(189,147,249,0.08)' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {last6months.map((_, i) => (
                <Cell key={i} fill={i === last6months.length - 1 ? D.purple : 'rgba(189,147,249,0.35)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: D.fg }}>Últimos lançamentos</p>
          {filtered.length > 4 && (
            <button
              onClick={goToTransactions}
              className="text-xs font-medium py-1 px-3 rounded-xl transition-all"
              style={{ background: 'rgba(189,147,249,0.15)', color: D.purple }}
            >
              Ver todos
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">💸</p>
            <p className="text-sm font-medium" style={{ color: D.comment }}>Nenhum lançamento este mês.</p>
            <button
              onClick={onAdd}
              className="mt-4 text-sm font-bold py-2.5 px-6 rounded-2xl transition-all active:scale-95"
              style={{ background: 'rgba(189,147,249,0.15)', color: D.purple, border: `1px solid rgba(189,147,249,0.3)` }}
            >
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
