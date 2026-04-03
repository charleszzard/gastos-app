import React, { useState } from 'react'
import { getCat } from '../constants'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function TransactionItem({ expense: e, onEdit }) {
  const { deleteExpense } = useApp()
  const [confirm, setConfirm] = useState(false)
  const cat = getCat(e.category)
  const isIncome = e.type === 'income'

  if (confirm) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-3 flex items-center justify-between">
        <span className="text-sm text-red-600 dark:text-red-400">Excluir "{e.desc}"?</span>
        <div className="flex gap-2">
          <button onClick={() => setConfirm(false)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">Não</button>
          <button onClick={() => deleteExpense(e.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white">Sim</button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cat.bg }}>
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{e.desc}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{cat.name} · {fmtDate(e.date)}</p>
      </div>
      <p className={`text-sm font-semibold flex-shrink-0 ${isIncome ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{fmt(e.amount)}
      </p>
      <button onClick={() => onEdit(e)} className="text-gray-300 dark:text-gray-600 hover:text-brand-600 dark:hover:text-brand-400 text-base px-1 transition-colors">✏️</button>
      <button onClick={() => setConfirm(true)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 text-base px-1 transition-colors">✕</button>
    </div>
  )
}
