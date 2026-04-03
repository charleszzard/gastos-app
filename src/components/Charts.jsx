import React, { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { useApp } from '../context/AppContext'
import { CATEGORIES, MONTHS } from '../constants'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', cyan: '#8be9fd',
  green: '#50fa7b', red: '#ff5555', orange: '#ffb86c', yellow: '#f1fa8c',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#44475a',
  border: '1px solid rgba(98,114,164,0.4)',
  borderRadius: 12,
  fontSize: 12,
  color: D.fg,
}
const CARD = {
  background: D.surface2,
  border: '1px solid rgba(98,114,164,0.2)',
  borderRadius: 18,
}

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
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
          style={{
            background: value === o.value ? D.purple : 'rgba(68,71,90,0.5)',
            color: value === o.value ? D.bg : D.comment,
            border: value === o.value ? `1px solid ${D.purple}` : '1px solid rgba(98,114,164,0.25)',
            boxShadow: value === o.value ? `0 0 10px rgba(189,147,249,0.3)` : 'none',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Charts({ month, year }) {
  const { data } = useApp()
  const [view, setView] = useState('year')

  const yearData = useMemo(() => {
    return MONTHS.map((name, m) => {
      const rows    = data.expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === m
      })
      const expense = rows.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      const income  = rows.filter(e => e.type === 'income' ).reduce((s, e) => s + e.amount, 0)
      return { name: name.slice(0, 3), expense, income, balance: income - expense }
    })
  }, [data.expenses, year])

  const dailyData = useMemo(() => {
    const days = new Date(year, month + 1, 0).getDate()
    const arr  = Array.from({ length: days }, (_, i) => ({ day: i + 1, total: 0, cum: 0 }))
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

  const compareData = useMemo(() => {
    return MONTHS.map((name, m) => {
      const get = (y) => data.expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return d.getFullYear() === y && d.getMonth() === m && e.type === 'expense'
      }).reduce((s, e) => s + e.amount, 0)
      return { name: name.slice(0, 3), [year]: get(year), [year - 1]: get(year - 1) }
    })
  }, [data.expenses, year])

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

  const totalExp   = yearData.reduce((s, d) => s + d.expense, 0)
  const totalInc   = yearData.reduce((s, d) => s + d.income, 0)
  const bestMonth  = [...yearData].sort((a, b) => a.expense - b.expense)[0]
  const worstMonth = [...yearData].sort((a, b) => b.expense - a.expense)[0]

  const kpis = [
    { label: `Total gasto ${year}`,    value: fmt(totalExp),       color: D.red },
    { label: `Total recebido ${year}`, value: fmt(totalInc),       color: D.green },
    { label: 'Mês mais econômico',     value: bestMonth.name,      color: D.cyan, sub: fmt(bestMonth.expense) },
    { label: 'Mês com mais gastos',    value: worstMonth.name,     color: D.orange, sub: fmt(worstMonth.expense) },
  ]

  const tickStyle = { fontSize: 10, fill: D.comment }
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(98,114,164,0.1)" vertical={false} />

  return (
    <div className="px-4 py-4 space-y-5 slide-up">

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-3.5 rounded-2xl" style={CARD}>
            <p className="text-[11px] mb-1 leading-tight" style={{ color: D.comment }}>{k.label}</p>
            <p
              className="text-base font-bold"
              style={{ color: k.color, textShadow: `0 0 12px ${k.color}60`, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {k.value}
            </p>
            {k.sub && <p className="text-[11px] mt-0.5" style={{ color: D.comment }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* View switcher */}
      <ChipFilter
        value={view}
        onChange={setView}
        options={[
          { value: 'year',    label: `Ano ${year}` },
          { value: 'daily',   label: 'Diário' },
          { value: 'compare', label: 'Comparar' },
          { value: 'cats',    label: 'Categorias' },
        ]}
      />

      {/* Year overview */}
      {view === 'year' && (
        <div className="p-4 rounded-2xl space-y-4" style={CARD}>
          <p className="text-sm font-semibold" style={{ color: D.fg }}>Receitas vs. Gastos por mês</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              {grid}
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(189,147,249,0.06)' }} />
              <Bar dataKey="income"  name="Receitas" fill={D.green}  radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="expense" name="Gastos"   fill={D.red}    radius={[3,3,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm font-semibold" style={{ color: D.fg }}>Saldo acumulado</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={yearData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              {grid}
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="balance" name="Saldo"
                stroke={D.purple} strokeWidth={2.5} dot={{ r: 3, fill: D.purple }}
                activeDot={{ r: 5, fill: D.purple, boxShadow: `0 0 8px ${D.purple}` }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily */}
      {view === 'daily' && (
        <div className="p-4 rounded-2xl space-y-4" style={CARD}>
          <p className="text-sm font-semibold" style={{ color: D.fg }}>
            Gastos diários — {MONTHS[month]}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              {grid}
              <XAxis dataKey="day" tick={{ ...tickStyle, fontSize: 9 }} interval={4} />
              <YAxis tick={{ ...tickStyle, fontSize: 9 }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} labelFormatter={d => `Dia ${d}`} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(189,147,249,0.06)' }} />
              <Bar dataKey="total" name="Gasto" fill={D.cyan} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm font-semibold" style={{ color: D.fg }}>Acumulado no mês</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              {grid}
              <XAxis dataKey="day" tick={{ ...tickStyle, fontSize: 9 }} interval={4} />
              <YAxis tick={{ ...tickStyle, fontSize: 9 }} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} labelFormatter={d => `Dia ${d}`} contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="cum" name="Acumulado"
                stroke={D.orange} strokeWidth={2.5} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Compare years */}
      {view === 'compare' && (
        <div className="p-4 rounded-2xl" style={CARD}>
          <p className="text-sm font-semibold mb-3" style={{ color: D.fg }}>
            {year - 1} vs {year} — Gastos mensais
          </p>
          <div className="flex gap-4 mb-3">
            {[[year - 1, D.comment], [year, D.purple]].map(([y, color]) => (
              <span key={y} className="flex items-center gap-1.5 text-xs" style={{ color: D.comment }}>
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {y}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={compareData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              {grid}
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={fmtK} />
              <Tooltip formatter={v => fmt(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(189,147,249,0.06)' }} />
              <Bar dataKey={String(year - 1)} name={String(year - 1)} fill={D.comment} radius={[3,3,0,0]} maxBarSize={14} />
              <Bar dataKey={String(year)}     name={String(year)}     fill={D.purple}  radius={[3,3,0,0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category donut */}
      {view === 'cats' && (
        <div className="p-4 rounded-2xl" style={CARD}>
          <p className="text-sm font-semibold mb-3" style={{ color: D.fg }}>
            Categorias — {MONTHS[month]}
          </p>
          {catData.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: D.comment }}>Sem gastos este mês</p>
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
                  const pct   = Math.round((c.value / total) * 100)
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}80` }} />
                      <span className="text-xs flex-1" style={{ color: D.comment }}>{c.icon} {c.name}</span>
                      <span className="text-xs" style={{ color: D.comment }}>{pct}%</span>
                      <span className="text-xs font-semibold" style={{ color: D.fg, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(c.value)}</span>
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
