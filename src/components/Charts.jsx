import React, { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { useApp } from '../context/AppContext'
import { CATEGORIES, MONTHS } from '../constants'

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtK(n) {
  return n >= 1000 ? `R$${(n / 1000).toFixed(1)}k` : `R$${n.toFixed(0)}`
}

function ChipFilter({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            value === o.value
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Charts({ month, year }) {
  const { data } = useApp()
  const [view, setView] = useState('year')  // year | daily | compare

  /* ── 12-month bar chart ── */
  const yearData = useMemo(() => {
    return MONTHS.map((name, m) => {
      const rows = data.expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === m
      })
      const expense = rows.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      const income  = rows.filter(e => e.type === 'income' ).reduce((s, e) => s + e.amount, 0)
      return { name: name.slice(0, 3), expense, income, balance: income - expense }
    })
  }, [data.expenses, year])

  /* ── daily spending current month ── */
  const dailyData = useMemo(() => {
    const days = new Date(year, month + 1, 0).getDate()
    const arr = Array.from({ length: days }, (_, i) => ({ day: i + 1, total: 0, cum: 0 }))
    data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === month && d.getFullYear() === year && e.type === 'expense'
    }).forEach(e => {
      const day = new Date(e.date + 'T00:00:00').getDate()
      arr[day - 1].total += e.amount
    })
    let acc = 0
    arr.forEach(d => { acc += d.total; d.cum = acc })
    return arr
  }, [data.expenses, month, year])

  /* ── year vs last year ── */
  const compareData = useMemo(() => {
    return MONTHS.map((name, m) => {
      const get = (y) => data.expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return d.getFullYear() === y && d.getMonth() === m && e.type === 'expense'
      }).reduce((s, e) => s + e.amount, 0)
      return { name: name.slice(0, 3), [year]: get(year), [year - 1]: get(year - 1) }
    })
  }, [data.expenses, year])

  /* ── category donut ── */
  const catData = useMemo(() => {
    const map = {}
    data.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === month && d.getFullYear() === year && e.type === 'expense'
    }).forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return CATEGORIES.filter(c => map[c.id])
      .map(c => ({ name: c.name, value: map[c.id], color: c.color, icon: c.icon }))
      .sort((a, b) => b.value - a.value)
  }, [data.expenses, month, year])

  const totalExp  = yearData.reduce((s, d) => s + d.expense, 0)
  const totalInc  = yearData.reduce((s, d) => s + d.income, 0)
  const bestMonth = [...yearData].sort((a, b) => a.expense - b.expense)[0]
  const worstMonth= [...yearData].sort((a, b) => b.expense - a.expense)[0]

  const TOOLTIP_STYLE = {
    backgroundColor: 'var(--tw-bg, #fff)',
    border: '0.5px solid #e5e7eb',
    borderRadius: 12,
    fontSize: 12,
  }

  return (
    <div className="px-4 py-4 space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: `Total gasto ${year}`,    value: fmt(totalExp), color: 'text-red-500' },
          { label: `Total recebido ${year}`, value: fmt(totalInc), color: 'text-brand-600 dark:text-brand-400' },
          { label: 'Mês mais econômico',     value: bestMonth.name,  color: 'text-gray-800 dark:text-gray-100', sub: fmt(bestMonth.expense) },
          { label: 'Mês com mais gastos',    value: worstMonth.name, color: 'text-gray-800 dark:text-gray-100', sub: fmt(worstMonth.expense) },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 leading-tight">{k.label}</p>
            <p className={`text-base font-semibold ${k.color}`}>{k.value}</p>
            {k.sub && <p className="text-[11px] text-gray-400 mt-0.5">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* View switcher */}
      <ChipFilter
        value={view}
        onChange={setView}
        options={[
          { value: 'year',    label: `Ano ${year}` },
          { value: 'daily',   label: 'Diário (mês atual)' },
          { value: 'compare', label: 'Comparar anos' },
          { value: 'cats',    label: 'Categorias' },
        ]}
      />

      {/* ── Year overview ── */}
      {view === 'year' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Receitas vs. Gastos por mês</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="income"  name="Receitas" fill="#1d9e75" radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="expense" name="Gastos"   fill="#e24b4a" radius={[3,3,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Saldo acumulado</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={yearData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone" dataKey="balance" name="Saldo"
                stroke="#7f77dd" strokeWidth={2} dot={{ r: 3, fill: '#7f77dd' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Daily ── */}
      {view === 'daily' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Gastos diários — {MONTHS[month]}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} labelFormatter={d => `Dia ${d}`} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="total" name="Gasto" fill="#378add" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Acumulado no mês</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} labelFormatter={d => `Dia ${d}`} contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone" dataKey="cum" name="Acumulado"
                stroke="#ef9f27" strokeWidth={2} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Compare years ── */}
      {view === 'compare' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            {year - 1} vs {year} — Gastos mensais
          </p>
          <div className="flex gap-4 mb-3">
            {[[year - 1, '#9ca3af'], [year, '#1d9e75']].map(([y, color]) => (
              <span key={y} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {y}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={compareData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey={String(year - 1)} name={String(year - 1)} fill="#9ca3af" radius={[3,3,0,0]} maxBarSize={14} />
              <Bar dataKey={String(year)}     name={String(year)}     fill="#1d9e75" radius={[3,3,0,0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Category donut ── */}
      {view === 'cats' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Categorias — {MONTHS[month]}
          </p>
          {catData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem gastos este mês</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                    {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {catData.map((c, i) => {
                  const total = catData.reduce((s, x) => s + x.value, 0)
                  const pct = Math.round((c.value / total) * 100)
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{c.icon} {c.name}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{fmt(c.value)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}
