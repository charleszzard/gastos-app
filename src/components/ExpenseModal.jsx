import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, INCOME_CATEGORIES } from '../constants'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6',
  green: '#50fa7b', red: '#ff5555', cyan: '#8be9fd',
}

const DEFAULT_FORM = {
  desc: '', amount: '', category: 'food', type: 'expense',
  date: new Date().toISOString().split('T')[0],
  note: '',
  recurring: false,
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
  transition: 'all 0.2s',
}

const EMOJI_OPTIONS = ['💼','💻','📈','🎁','🏘️','↩️','🏆','💰','🌟','🎯','⚡','🔑','🎵','🛠️','🌱','💎','🚀','🎪','🎓','🏋️']
const COLOR_OPTIONS = ['#50fa7b','#8be9fd','#bd93f9','#ff79c6','#ffb86c','#f1fa8c','#ff5555','#6be5fd','#50b4fa','#c0e070']

function DracInput({ label, children }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-xs font-semibold mb-1.5" style={{ color: D.comment }}>{label}</label>}
      {children}
    </div>
  )
}

// Mini modal para criar nova categoria
function NewCategoryModal({ forType, onSave, onClose, customCategories }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('⭐')
  const [color, setColor] = useState('#50fa7b')
  const [customIcon, setCustomIcon] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) { setError('Informe o nome da categoria'); return }
    const finalIcon = customIcon.trim() || icon
    onSave({ name: name.trim(), icon: finalIcon, color, forType })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl px-5 pt-5 pb-6"
        style={{
          background: D.surface2,
          border: '1px solid rgba(189,147,249,0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: D.fg }}>
            ✨ Nova categoria de {forType === 'income' ? 'receita' : 'despesa'}
          </h3>
          <button onClick={onClose} style={{ color: D.comment }} className="text-lg leading-none">✕</button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl" style={{ background: 'rgba(40,42,54,0.6)' }}>
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: color + '22', border: `1.5px solid ${color}55` }}
          >
            {customIcon.trim() || icon}
          </span>
          <span className="text-sm font-bold" style={{ color: color }}>{name || 'Nome da categoria'}</span>
        </div>

        <DracInput label="Nome">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Salário Extra, Pensão..."
            style={INPUT_STYLE}
          />
        </DracInput>

        <div className="mb-3">
          <label className="block text-xs font-semibold mb-2" style={{ color: D.comment }}>Ícone</label>
          <div className="grid grid-cols-10 gap-1.5 mb-2">
            {EMOJI_OPTIONS.map(em => (
              <button
                key={em}
                onClick={() => { setIcon(em); setCustomIcon('') }}
                className="text-lg rounded-xl py-1 transition-all"
                style={{
                  background: icon === em && !customIcon ? 'rgba(189,147,249,0.2)' : 'rgba(40,42,54,0.5)',
                  border: icon === em && !customIcon ? '1.5px solid rgba(189,147,249,0.5)' : '1.5px solid transparent',
                }}
              >{em}</button>
            ))}
          </div>
          <input
            value={customIcon}
            onChange={e => setCustomIcon(e.target.value)}
            placeholder="Ou cole um emoji aqui..."
            style={{ ...INPUT_STYLE, padding: '8px 12px', fontSize: '0.8rem' }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: D.comment }}>Cor</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  border: color === c ? `2px solid ${D.fg}` : '2px solid transparent',
                  boxShadow: color === c ? `0 0 10px ${c}80` : 'none',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ color: D.red, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)' }}>
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${D.purple}, ${D.pink})`,
            color: D.bg,
            boxShadow: `0 4px 16px rgba(189,147,249,0.35)`,
          }}
        >
          Criar categoria
        </button>
      </div>
    </div>
  )
}

export default function ExpenseModal({ initial, onClose }) {
  const { addExpense, updateExpense, addCustomCategory, data } = useApp()
  const customCategories = data.customCategories || []

  const [form, setForm] = useState(
    initial
      ? { ...DEFAULT_FORM, ...initial, amount: String(initial.amount) }
      : DEFAULT_FORM
  )
  const [error, setError]     = useState('')
  const [showNote, setShowNote] = useState(!!(initial?.note))
  const [focused, setFocused]   = useState(null)
  const [showNewCat, setShowNewCat] = useState(false)
  const descRef = useRef(null)

  useEffect(() => { setTimeout(() => descRef.current?.focus(), 300) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // When type changes, reset category to a valid default for that type
  const handleTypeChange = (t) => {
    const defaultCat = t === 'income' ? 'salary' : 'food'
    setForm(f => ({ ...f, type: t, category: defaultCat }))
  }

  const submit = () => {
    const amt = parseFloat(form.amount.replace(',', '.'))
    if (!form.desc.trim()) { setError('Informe uma descrição'); return }
    if (isNaN(amt) || amt <= 0) { setError('Informe um valor válido'); return }
    const payload = { ...form, amount: amt, note: form.note?.trim() || '' }
    if (initial) updateExpense({ ...initial, ...payload })
    else addExpense(payload)
    onClose()
  }

  const focusStyle = (name) => focused === name
    ? { ...INPUT_STYLE, borderColor: D.purple, boxShadow: `0 0 0 3px rgba(189,147,249,0.15)` }
    : INPUT_STYLE

  // Which categories to show based on type
  const baseCategories = form.type === 'income' ? INCOME_CATEGORIES : CATEGORIES
  const myCustom = customCategories.filter(c => c.forType === form.type)
  const allCats = [...baseCategories, ...myCustom]

  const handleNewCatSave = (cat) => {
    addCustomCategory(cat)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-md rounded-t-3xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto slide-up"
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
            {initial ? '✏️ Editar lançamento' : '＋ Novo lançamento'}
          </h2>

          {/* Type toggle */}
          <div className="flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: 'rgba(40,42,54,0.6)' }}>
            {[['expense', '↓ Gasto'], ['income', '↑ Receita']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: form.type === t
                    ? t === 'expense' ? 'rgba(255,85,85,0.2)' : 'rgba(80,250,123,0.2)'
                    : 'transparent',
                  color: form.type === t
                    ? t === 'expense' ? D.red : D.green
                    : D.comment,
                  border: form.type === t
                    ? `1px solid ${t === 'expense' ? 'rgba(255,85,85,0.4)' : 'rgba(80,250,123,0.4)'}`
                    : '1px solid transparent',
                  boxShadow: form.type === t
                    ? `0 0 16px ${t === 'expense' ? 'rgba(255,85,85,0.2)' : 'rgba(80,250,123,0.2)'}`
                    : 'none',
                }}
              >{label}</button>
            ))}
          </div>

          {/* Description */}
          <DracInput label="Descrição">
            <input
              ref={descRef}
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
              placeholder="Ex: Almoço, Salário, Netflix..."
              style={{ ...focusStyle('desc') }}
            />
          </DracInput>

          {/* Amount */}
          <DracInput label="Valor (R$)">
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
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </DracInput>

          {/* Date */}
          <DracInput label="Data">
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              onFocus={() => setFocused('date')}
              onBlur={() => setFocused(null)}
              style={{
                ...focusStyle('date'),
                colorScheme: 'dark',
              }}
            />
          </DracInput>

          {/* Category */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold" style={{ color: D.comment }}>
                Categoria {form.type === 'income' ? '(Receita)' : '(Despesa)'}
              </label>
              <button
                onClick={() => setShowNewCat(true)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl transition-all active:scale-95"
                style={{
                  background: 'rgba(189,147,249,0.12)',
                  color: D.purple,
                  border: '1px solid rgba(189,147,249,0.25)',
                }}
              >
                ＋ Nova
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {allCats.map(c => (
                <button
                  key={c.id}
                  onClick={() => set('category', c.id)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-center transition-all"
                  style={{
                    background: form.category === c.id ? 'rgba(189,147,249,0.15)' : 'rgba(40,42,54,0.5)',
                    border: form.category === c.id
                      ? `1px solid rgba(189,147,249,0.5)`
                      : '1px solid rgba(98,114,164,0.2)',
                    boxShadow: form.category === c.id ? '0 0 12px rgba(189,147,249,0.15)' : 'none',
                  }}
                >
                  <span className="text-xl leading-none">{c.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight" style={{ color: form.category === c.id ? D.purple : D.comment }}>
                    {c.name.length > 7 ? c.name.slice(0, 7) + '…' : c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
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
                style={{ background: form.recurring ? D.purple : 'rgba(98,114,164,0.4)', boxShadow: form.recurring ? `0 0 8px ${D.purple}60` : 'none' }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full shadow transition-transform"
                  style={{ background: D.fg, transform: form.recurring ? 'translateX(16px)' : 'translateX(2px)' }}
                />
              </span>
              {form.recurring ? '🔁 Lançamento recorrente (mensal)' : '🔁 Marcar como recorrente'}
            </button>
          </div>

          {/* Note */}
          <div className="mb-5">
            {!showNote ? (
              <button
                onClick={() => setShowNote(true)}
                className="text-xs font-medium flex items-center gap-1 transition-all"
                style={{ color: D.purple }}
              >
                <span>＋</span> Adicionar observação
              </button>
            ) : (
              <DracInput label="Observação (opcional)">
                <input
                  autoFocus
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  onFocus={() => setFocused('note')}
                  onBlur={() => setFocused(null)}
                  placeholder="Anotação, referência, detalhe..."
                  style={focusStyle('note')}
                />
              </DracInput>
            )}
          </div>

          {error && (
            <p className="text-sm mb-3 px-3 py-2 rounded-xl" style={{ color: D.red, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)' }}>
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
            {initial ? 'Salvar alterações' : 'Adicionar lançamento'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 mt-2 rounded-2xl text-sm font-medium transition-all"
            style={{ color: D.comment }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {showNewCat && (
        <NewCategoryModal
          forType={form.type}
          customCategories={customCategories}
          onSave={handleNewCatSave}
          onClose={() => setShowNewCat(false)}
        />
      )}
    </>
  )
}
