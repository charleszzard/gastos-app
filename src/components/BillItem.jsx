import React from 'react'
import { getCat, MONTHS } from '../constants'

const D = {
  bg: '#282a36', surface2: '#373948', comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', green: '#50fa7b', red: '#ff5555', orange: '#ffb86c',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Returns { label, color, urgency } based on due date relative to the selected month/year
export function getBillStatus(bill, refMonth, refYear) {
  if (bill.paid) {
    return { label: '✅ Paga', color: D.green, bg: 'rgba(80,250,123,0.12)', urgency: 0 }
  }

  const today = new Date()
  const curMonth = refMonth ?? today.getMonth()
  const curYear  = refYear  ?? today.getFullYear()

  const dueDate  = new Date(curYear, curMonth, bill.dueDay)
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Only compute urgency relative to today if the ref month == current real month
  const isCurrentMonth = curMonth === today.getMonth() && curYear === today.getFullYear()

  if (isCurrentMonth) {
    const diffDays = Math.round((dueDate - todayDay) / 86400000)
    if (diffDays < 0)   return { label: `⚠️ Vencida há ${Math.abs(diffDays)}d`,  color: D.red,     bg: 'rgba(255,85,85,0.12)',   urgency: 3 }
    if (diffDays === 0) return { label: '🔴 Vence hoje!',                          color: D.red,     bg: 'rgba(255,85,85,0.12)',   urgency: 3 }
    if (diffDays <= 3)  return { label: `🟠 Vence em ${diffDays}d`,               color: D.orange,  bg: 'rgba(255,184,108,0.12)', urgency: 2 }
    if (diffDays <= 7)  return { label: `🟡 Vence em ${diffDays}d`,               color: '#f1fa8c', bg: 'rgba(241,250,140,0.1)',  urgency: 1 }
  } else if (new Date(curYear, curMonth) < new Date(today.getFullYear(), today.getMonth())) {
    // Past month
    return { label: `⚠️ Mês passado`,  color: D.red, bg: 'rgba(255,85,85,0.12)', urgency: 2 }
  } else {
    // Future month
    return { label: `📅 Dia ${bill.dueDay}`, color: D.comment, bg: 'rgba(98,114,164,0.12)', urgency: 0 }
  }

  return { label: `📅 Dia ${bill.dueDay}`, color: D.comment, bg: 'rgba(98,114,164,0.12)', urgency: 0 }
}

export default function BillItem({ bill, onEdit, onPay, onUnpay, onDelete, refMonth, refYear }) {
  const cat    = getCat(bill.category)
  const status = getBillStatus(bill, refMonth, refYear)

  const isParcelado = (bill.installments || 1) > 1
  const remaining   = isParcelado ? (bill.installments - bill.currentInstallment + 1) : null

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: D.surface2,
        border: `1px solid ${bill.paid ? 'rgba(98,114,164,0.15)' : status.urgency >= 2 ? 'rgba(255,85,85,0.25)' : 'rgba(98,114,164,0.2)'}`,
        boxShadow: !bill.paid && status.urgency >= 2 ? '0 4px 20px rgba(255,85,85,0.15)' : '0 2px 10px rgba(0,0,0,0.25)',
        opacity: bill.paid ? 0.65 : 1,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}25` }}
        >
          {cat.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: D.fg }}>
            {bill.name}
            {isParcelado && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(189,147,249,0.15)', color: D.purple }}>
                {bill.currentInstallment}/{bill.installments}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
            {bill.recurring && !bill.paid && !isParcelado && (
              <span className="text-[10px] font-medium" style={{ color: D.purple }}>🔁 Mensal</span>
            )}
            {isParcelado && remaining !== null && !bill.paid && (
              <span className="text-[10px] font-medium" style={{ color: '#8be9fd' }}>
                💳 {remaining} parcela{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p
            className="text-sm font-bold"
            style={{ color: D.fg, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {fmt(bill.amount)}
          </p>
          <p className="text-[10px]" style={{ color: D.comment }}>
            dia {bill.dueDay}
            {bill.dueMonth !== undefined && (
              <span> · {MONTHS[bill.dueMonth]?.slice(0, 3)}</span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex" style={{ borderTop: '1px solid rgba(98,114,164,0.1)' }}>
        {bill.paid ? (
          <button
            onClick={() => onUnpay(bill.id)}
            className="flex-1 py-2 text-xs font-medium transition-all"
            style={{ color: D.comment }}
          >
            Desfazer
          </button>
        ) : (
          <button
            onClick={() => onPay(bill)}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={{ color: D.green }}
          >
            ✓ Marcar como paga
          </button>
        )}
        <div className="w-px" style={{ background: 'rgba(98,114,164,0.12)' }} />
        <button
          onClick={() => onEdit(bill)}
          className="px-4 py-2 text-xs font-semibold transition-all"
          style={{ color: D.purple }}
        >
          Editar
        </button>
        <div className="w-px" style={{ background: 'rgba(98,114,164,0.12)' }} />
        <button
          onClick={() => onDelete(bill.id)}
          className="px-4 py-2 text-xs font-semibold transition-all"
          style={{ color: D.red }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}
