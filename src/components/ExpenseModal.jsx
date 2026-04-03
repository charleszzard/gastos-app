import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../constants'

const DEFAULT_FORM = {
  desc: '', amount: '', category: 'food', type: 'expense',
  date: new Date().toISOString().split('T')[0]
}

export default function ExpenseModal({ initial, onClose }) {
  const { addExpense, updateExpense } = useApp()
  const [form, setForm] = useState(initial ? { ...initial, amount: String(initial.amount) } : DEFAULT_FORM)
  const [error, setError] = useState('')
  const descRef = useRef(null)

  useEffect(() => { setTimeout(() => descRef.current?.focus(), 300) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    const amt = parseFloat(form.amount.replace(',', '.'))
    if (!form.desc.trim()) { setError('Informe uma descrição'); return }
    if (isNaN(amt) || amt <= 0) { setError('Informe um valor válido'); return }
    const payload = { ...form, amount: amt }
    if (initial) updateExpense({ ...initial, ...payload })
    else addExpense(payload)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-9 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
          {initial ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {[['expense', '↓ Gasto'], ['income', '↑ Receita']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => set('type', t)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                form.type === t
                  ? t === 'expense' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    : 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-transparent'
              }`}
            >{label}</button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5">Descrição</label>
          <input
            ref={descRef}
            value={form.desc}
            onChange={e => set('desc', e.target.value)}
            placeholder="Ex: Almoço, Salário, Netflix..."
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-brand-400"
          />
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5">Valor (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0,00"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-lg font-semibold text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-brand-400"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5">Data</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-400"
          />
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-2">Categoria</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => set('category', c.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-center transition-all ${
                  form.category === c.id ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <span className="text-xl leading-none">{c.icon}</span>
                <span className={`text-[10px] font-medium ${form.category === c.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {c.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button onClick={submit} className="w-full py-4 rounded-2xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-400 active:scale-98 transition-all">
          {initial ? 'Salvar alterações' : 'Adicionar lançamento'}
        </button>
        <button onClick={onClose} className="w-full py-3 mt-2 rounded-2xl text-sm text-gray-400 dark:text-gray-500">
          Cancelar
        </button>
      </div>
    </div>
  )
}
