import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getCat } from '../constants'

const D = {
  surface2: '#373948', comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', green: '#50fa7b', red: '#ff5555',
  orange: '#ffb86c', bg: '#282a36',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function TransactionItem({ expense: e, onEdit }) {
  const { deleteExpense } = useApp()
  const cat = getCat(e.category)
  const isIncome = e.type === 'income'
  const [expanded, setExpanded] = useState(false)

  const dateStr = new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short'
  })

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: D.surface2,
        border: `1px solid ${expanded ? 'rgba(189,147,249,0.25)' : 'rgba(98,114,164,0.15)'}`,
        boxShadow: expanded ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
        style={{ background: 'transparent' }}
        onClick={() => setExpanded(x => !x)}
      >
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}
        >
          {cat.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate" style={{ color: D.fg }}>{e.desc}</p>
            {e.recurring && (
              <span className="text-[10px] flex-shrink-0" style={{ color: D.purple }}>🔁</span>
            )}
            {e.note && (
              <span className="text-[10px] flex-shrink-0" style={{ color: D.comment }}>📝</span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: D.comment }}>{cat.name} · {dateStr}</p>
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p
            className="text-sm font-bold"
            style={{
              color: isIncome ? D.green : D.fg,
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: isIncome ? `0 0 12px ${D.green}60` : 'none',
            }}
          >
            {isIncome ? '+' : '-'}{fmt(e.amount)}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: D.comment }}>{expanded ? '▲' : '▼'}</p>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 py-3 space-y-2"
          style={{ background: 'rgba(40,42,54,0.5)', borderTop: '1px solid rgba(98,114,164,0.15)' }}
        >
          {e.note && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">📝</span>
              <p className="text-xs" style={{ color: D.comment }}>{e.note}</p>
            </div>
          )}
          {e.recurring && (
            <div className="flex items-center gap-2">
              <span className="text-sm">🔁</span>
              <p className="text-xs font-medium" style={{ color: D.purple }}>Lançamento recorrente mensal</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onEdit(e); setExpanded(false) }}
              className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all active:scale-95"
              style={{
                background: 'rgba(189,147,249,0.12)',
                color: D.purple,
                border: `1px solid rgba(189,147,249,0.25)`,
              }}
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => deleteExpense(e.id)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all active:scale-95"
              style={{
                background: 'rgba(255,85,85,0.1)',
                color: D.red,
                border: `1px solid rgba(255,85,85,0.2)`,
              }}
            >
              🗑️ Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
