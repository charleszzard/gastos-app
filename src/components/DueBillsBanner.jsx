import React from 'react'
import { useApp } from '../context/AppContext'
import { getBillStatus } from './BillItem'

const D = {
  comment: '#6272a4', fg: '#f8f8f2',
  red: '#ff5555', orange: '#ffb86c', yellow: '#f1fa8c',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DueBillsBanner({ goToBills }) {
  const { data } = useApp()
  const bills = data.bills || []

  const urgent = bills
    .filter(b => !b.paid && getBillStatus(b).urgency >= 1)
    .sort((a, b) => getBillStatus(b).urgency - getBillStatus(a).urgency || a.dueDay - b.dueDay)

  if (urgent.length === 0) return null

  const topUrgency    = getBillStatus(urgent[0]).urgency
  const overdueCount  = urgent.filter(b => getBillStatus(b).urgency >= 3).length

  const gradients = {
    3: 'linear-gradient(135deg, rgba(255,85,85,0.2) 0%, rgba(255,85,85,0.08) 100%)',
    2: 'linear-gradient(135deg, rgba(255,184,108,0.18) 0%, rgba(255,184,108,0.06) 100%)',
    1: 'linear-gradient(135deg, rgba(241,250,140,0.13) 0%, rgba(241,250,140,0.05) 100%)',
  }
  const borders = { 3: 'rgba(255,85,85,0.35)', 2: 'rgba(255,184,108,0.3)', 1: 'rgba(241,250,140,0.2)' }
  const titleColors = { 3: D.red, 2: D.orange, 1: D.yellow }
  const itemBorders = { 3: 'rgba(255,85,85,0.15)', 2: 'rgba(255,184,108,0.12)', 1: 'rgba(241,250,140,0.1)' }

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.99]"
      style={{
        background: gradients[topUrgency] || gradients[1],
        border: `1px solid ${borders[topUrgency] || borders[1]}`,
        boxShadow: topUrgency >= 3 ? '0 4px 20px rgba(255,85,85,0.15)' : '0 4px 16px rgba(0,0,0,0.2)',
      }}
      onClick={goToBills}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: titleColors[topUrgency] }}>
            {overdueCount > 0 ? '⚠️ Contas vencidas!' : '🔔 Próximos vencimentos'}
          </p>
          <p className="text-sm font-semibold" style={{ color: D.fg }}>
            {urgent.length} conta{urgent.length !== 1 ? 's' : ''} precisam de atenção
          </p>
        </div>
        <span className="text-base" style={{ color: titleColors[topUrgency] || D.comment }}>→</span>
      </div>

      <div className="space-y-1.5">
        {urgent.slice(0, 3).map(b => {
          const st = getBillStatus(b)
          const urgency = st.urgency
          return (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{
                background: 'rgba(40,42,54,0.5)',
                border: `1px solid ${itemBorders[urgency] || itemBorders[1]}`,
              }}
            >
              <span className="text-xs font-medium truncate flex-1" style={{ color: D.fg }}>{b.name}</span>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="text-[10px]" style={{ color: st.color }}>{st.label}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: titleColors[urgency] || D.comment, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {fmt(b.amount)}
                </span>
              </div>
            </div>
          )
        })}
        {urgent.length > 3 && (
          <p className="text-[11px] text-center mt-1" style={{ color: D.comment }}>
            + {urgent.length - 3} mais · Toque para ver todas
          </p>
        )}
      </div>
    </div>
  )
}
