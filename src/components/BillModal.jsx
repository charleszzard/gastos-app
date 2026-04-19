import React, { useState } from 'react'
import { CATEGORIES, MONTHS } from '../constants'

const D = {
  bg: '#282a36', surface2: '#373948', comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6',
}

const now = new Date()

const DEFAULT_FORM = {
  name: '', amount: '', dueDay: new Date().getDate(),
  dueMonth: now.getMonth(),          // 0-indexed month when first due
  dueYear: now.getFullYear(),
  installments: 1,                   // 1 = único, N = parcelado
  currentInstallment: 1,             // qual a parcela atual
  category: 'housing', recurring: false, note: '',
}

const INPUT_STYLE = {
  background: 'rgba(40,42,54,0.8)',
  border: '1px solid rgba(98,114,164,0.35)',
  borderRadius: 14,
  padding: '12px 16px',
  color: D.fg,
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
}

export default function BillModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...DEFAULT_FORM,
          ...initial,
          amount: String(initial.amount),
          installments: initial.installments || 1,
          currentInstallment: initial.currentInstallment || 1,
          dueMonth: initial.dueMonth ?? now.getMonth(),
          dueYear: initial.dueYear ?? now.getFullYear(),
        }
      : DEFAULT_FORM
  )
  const [error, setError]   = useState('')
  const [focused, setFocused] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isParcelado = parseInt(form.installments) > 1

  const submit = () => {
    const amt = parseFloat(String(form.amount).replace(',', '.'))
    const day = parseInt(form.dueDay)
    const inst = parseInt(form.installments)
    const curInst = parseInt(form.currentInstallment)

    if (!form.name.trim()) { setError('Informe o nome da conta'); return }
    if (isNaN(amt) || amt <= 0) { setError('Informe um valor válido'); return }
    if (isNaN(day) || day < 1 || day > 31) { setError('Dia de vencimento inválido (1-31)'); return }
    if (isNaN(inst) || inst < 1) { setError('Número de parcelas inválido'); return }
    if (isParcelado && (isNaN(curInst) || curInst < 1 || curInst > inst)) {
      setError(`Parcela atual deve ser entre 1 e ${inst}`); return
    }

    onSave({
      ...form,
      amount: amt,
      dueDay: day,
      installments: inst,
      currentInstallment: isParcelado ? curInst : 1,
      dueMonth: parseInt(form.dueMonth),
      dueYear: parseInt(form.dueYear),
      recurring: !isParcelado && form.recurring,
    })
    onClose()
  }

  const focusStyle = (name) => focused === name
    ? { ...INPUT_STYLE, borderColor: D.purple, boxShadow: `0 0 0 3px rgba(189,147,249,0.15)` }
    : INPUT_STYLE

  const selectStyle = {
    ...INPUT_STYLE,
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    paddingRight: 32,
  }

  // Years for due year selector
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl px-5 pt-4 pb-8 max-h-[92vh] overflow-y-auto slide-up"
        style={{
          background: D.surface2,
          border: '1px solid rgba(189,147,249,0.15)',
          borderBottom: 'none',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: `linear-gradient(90deg, ${D.purple}, ${D.pink})` }} />

        <h2 className="text-lg font-bold mb-5" style={{ color: D.fg }}>
          {initial ? '✏️ Editar conta' : '🧾 Nova conta a pagar'}
        </h2>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Nome da conta</label>
          <input
            autoFocus
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="Ex: Aluguel, Luz, Internet, Netflix..."
            style={focusStyle('name')}
          />
        </div>

        {/* Amount + Due Day */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Valor (R$)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              onFocus={() => setFocused('amount')}
              onBlur={() => setFocused(null)}
              placeholder="0,00"
              style={{
                ...focusStyle('amount'),
                fontSize: '1.125rem',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Dia venc.</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={form.dueDay}
              onChange={e => set('dueDay', e.target.value)}
              onFocus={() => setFocused('day')}
              onBlur={() => setFocused(null)}
              style={{ ...focusStyle('day'), textAlign: 'center', fontWeight: 700, fontSize: '1.125rem' }}
            />
          </div>
        </div>

        {/* Due Month + Year */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Mês de vencimento</label>
            <select
              value={form.dueMonth}
              onChange={e => set('dueMonth', parseInt(e.target.value))}
              style={selectStyle}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i} style={{ background: D.bg }}>{m}</option>
              ))}
            </select>
            <span className="absolute right-3 top-9 pointer-events-none text-xs" style={{ color: D.comment }}>▼</span>
          </div>
          <div className="w-28 relative">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Ano</label>
            <select
              value={form.dueYear}
              onChange={e => set('dueYear', parseInt(e.target.value))}
              style={selectStyle}
            >
              {years.map(y => (
                <option key={y} value={y} style={{ background: D.bg }}>{y}</option>
              ))}
            </select>
            <span className="absolute right-3 top-9 pointer-events-none text-xs" style={{ color: D.comment }}>▼</span>
          </div>
        </div>

        {/* Parcelas section */}
        <div className="mb-4 rounded-2xl p-4" style={{ background: 'rgba(40,42,54,0.6)', border: '1px solid rgba(98,114,164,0.2)' }}>
          <label className="block text-xs font-semibold mb-3" style={{ color: D.comment }}>💳 Parcelamento</label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[11px] mb-1" style={{ color: D.comment }}>Total de parcelas</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                value={form.installments}
                onChange={e => {
                  const v = parseInt(e.target.value) || 1
                  set('installments', v)
                  if (parseInt(form.currentInstallment) > v) set('currentInstallment', v)
                }}
                onFocus={() => setFocused('installments')}
                onBlur={() => setFocused(null)}
                style={{ ...focusStyle('installments'), textAlign: 'center', fontWeight: 700, fontSize: '1.125rem' }}
              />
            </div>
            {isParcelado && (
              <div className="flex-1">
                <label className="block text-[11px] mb-1" style={{ color: D.comment }}>Parcela atual</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={form.installments}
                  value={form.currentInstallment}
                  onChange={e => set('currentInstallment', e.target.value)}
                  onFocus={() => setFocused('curInst')}
                  onBlur={() => setFocused(null)}
                  style={{ ...focusStyle('curInst'), textAlign: 'center', fontWeight: 700, fontSize: '1.125rem' }}
                />
              </div>
            )}
          </div>

          {isParcelado && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(189,147,249,0.08)', border: '1px solid rgba(189,147,249,0.2)' }}>
              <span className="text-sm">📦</span>
              <p className="text-[11px]" style={{ color: D.purple }}>
                Parcela <strong>{form.currentInstallment}</strong> de <strong>{form.installments}</strong>
                {' · '}Restam <strong>{form.installments - form.currentInstallment + 1}</strong> pagamento{form.installments - form.currentInstallment + 1 !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Recurring toggle — only for non-parcelado */}
        {!isParcelado && (
          <div className="mb-4">
            <button
              onClick={() => set('recurring', !form.recurring)}
              className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all w-full"
              style={{
                background: form.recurring ? 'rgba(189,147,249,0.12)' : 'rgba(40,42,54,0.5)',
                border: form.recurring ? `1px solid rgba(189,147,249,0.3)` : '1px solid rgba(98,114,164,0.2)',
                color: form.recurring ? D.purple : D.comment,
              }}
            >
              <span
                className="w-8 h-4 rounded-full relative flex-shrink-0 transition-all"
                style={{ background: form.recurring ? D.purple : 'rgba(98,114,164,0.4)', boxShadow: form.recurring ? `0 0 8px rgba(189,147,249,0.5)` : 'none' }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full shadow transition-transform"
                  style={{ background: '#f8f8f2', transform: form.recurring ? 'translateX(16px)' : 'translateX(2px)' }}
                />
              </span>
              {form.recurring ? '🔁 Cobrança mensal (recorrente)' : '1️⃣ Pagamento único'}
            </button>
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: D.comment }}>Categoria</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => set('category', c.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl text-center transition-all"
                style={{
                  background: form.category === c.id ? 'rgba(189,147,249,0.15)' : 'rgba(40,42,54,0.5)',
                  border: form.category === c.id
                    ? `1px solid rgba(189,147,249,0.5)`
                    : '1px solid rgba(98,114,164,0.2)',
                  boxShadow: form.category === c.id ? '0 0 12px rgba(189,147,249,0.15)' : 'none',
                }}
              >
                <span className="text-xl leading-none">{c.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: form.category === c.id ? D.purple : D.comment }}>
                  {c.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>Observação (opcional)</label>
          <input
            value={form.note}
            onChange={e => set('note', e.target.value)}
            onFocus={() => setFocused('note')}
            onBlur={() => setFocused(null)}
            placeholder="Banco, número do contrato, etc."
            style={focusStyle('note')}
          />
        </div>

        {error && (
          <p
            className="text-sm mb-3 px-3 py-2 rounded-xl"
            style={{ color: '#ff5555', background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)' }}
          >
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={submit}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${D.purple}, ${D.pink})`,
            color: D.bg,
            boxShadow: `0 4px 20px rgba(189,147,249,0.4)`,
          }}
        >
          {initial ? 'Salvar alterações' : 'Adicionar conta'}
        </button>
        <button onClick={onClose} className="w-full py-3 mt-2 rounded-2xl text-sm font-medium" style={{ color: D.comment }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
