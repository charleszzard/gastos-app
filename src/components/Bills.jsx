import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import BillItem, { getBillStatus } from './BillItem'
import BillModal from './BillModal'

const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', green: '#50fa7b',
  red: '#ff5555', orange: '#ffb86c',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Bills() {
  const { data, addBill, updateBill, deleteBill, payBill, unmarkPaid } = useApp()
  const [modal, setModal]       = useState(false)
  const [editData, setEditData] = useState(null)
  const [filter, setFilter]     = useState('all')
  const [confirmPay, setConfirmPay] = useState(null)

  const bills = data.bills || []

  const sorted = useMemo(() => {
    return [...bills]
      .filter(b => {
        if (filter === 'pending') return !b.paid
        if (filter === 'paid') return b.paid
        return true
      })
      .sort((a, b) => {
        if (a.paid !== b.paid) return a.paid ? 1 : -1
        return getBillStatus(b).urgency - getBillStatus(a).urgency || a.dueDay - b.dueDay
      })
  }, [bills, filter])

  const totalPending  = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
  const totalPaid     = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0)
  const pendingCount  = bills.filter(b => !b.paid).length
  const urgentCount   = bills.filter(b => !b.paid && getBillStatus(b).urgency >= 2).length

  const openAdd  = () => { setEditData(null); setModal(true) }
  const openEdit = (b) => { setEditData(b); setModal(true) }
  const handleSave = (formData) => {
    if (editData) updateBill({ ...editData, ...formData })
    else addBill(formData)
  }

  const confirmPayment = (createExpense) => {
    if (!confirmPay) return
    const expenseData = createExpense ? {
      desc: confirmPay.name,
      amount: confirmPay.amount,
      category: confirmPay.category,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      note: `Pago via conta: ${confirmPay.name}`,
    } : null
    payBill(confirmPay.id, expenseData)
    setConfirmPay(null)
  }

  return (
    <div className="px-4 py-4 space-y-4 slide-up">
      {/* Header cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pending */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(189,147,249,0.15) 0%, rgba(255,121,198,0.1) 100%)',
            border: `1px solid rgba(189,147,249,0.25)`,
            boxShadow: `0 4px 20px rgba(189,147,249,0.1)`,
          }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: 'rgba(189,147,249,0.08)' }} />
          <p className="text-[11px] font-semibold mb-1" style={{ color: 'rgba(189,147,249,0.7)' }}>A pagar</p>
          <p
            className="text-xl font-black"
            style={{ color: D.purple, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px rgba(189,147,249,0.4)` }}
          >
            {fmt(totalPending)}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: D.comment }}>
            {pendingCount} conta{pendingCount !== 1 ? 's' : ''}
            {urgentCount > 0 && (
              <span className="ml-1 font-bold" style={{ color: D.red }}>· {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Paid */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'rgba(80,250,123,0.08)',
            border: '1px solid rgba(80,250,123,0.2)',
          }}
        >
          <p className="text-[11px] font-semibold mb-1" style={{ color: 'rgba(80,250,123,0.7)' }}>✅ Pagas</p>
          <p
            className="text-xl font-black"
            style={{ color: D.green, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px rgba(80,250,123,0.3)` }}
          >
            {fmt(totalPaid)}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: D.comment }}>
            {bills.filter(b => b.paid).length} conta{bills.filter(b => b.paid).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[['all', 'Todas'], ['pending', '⏳ Pendentes'], ['paid', '✅ Pagas']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: filter === v ? D.purple : 'rgba(68,71,90,0.5)',
              color: filter === v ? D.bg : D.comment,
              border: filter === v ? `1px solid ${D.purple}` : '1px solid rgba(98,114,164,0.25)',
              boxShadow: filter === v ? `0 0 10px rgba(189,147,249,0.3)` : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={openAdd}
        className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        style={{
          background: 'rgba(189,147,249,0.08)',
          border: '2px dashed rgba(189,147,249,0.3)',
          color: D.purple,
        }}
      >
        <span className="text-lg">＋</span> Adicionar conta
      </button>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-5xl mb-3">🧾</p>
          <p className="text-sm font-medium" style={{ color: D.comment }}>
            {filter === 'paid' ? 'Nenhuma conta paga ainda.' :
             filter === 'pending' ? 'Nenhuma conta pendente! 🎉' :
             'Nenhuma conta cadastrada.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={openAdd}
              className="mt-4 text-sm font-bold py-2.5 px-6 rounded-2xl transition-all active:scale-95"
              style={{ background: 'rgba(189,147,249,0.15)', color: D.purple, border: `1px solid rgba(189,147,249,0.3)` }}
            >
              Cadastrar primeira conta
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(b => (
            <BillItem
              key={b.id}
              bill={b}
              onEdit={openEdit}
              onPay={setConfirmPay}
              onUnpay={() => unmarkPaid(b.id)}
              onDelete={() => deleteBill(b.id)}
            />
          ))}
        </div>
      )}

      {modal && (
        <BillModal
          initial={editData}
          onClose={() => { setModal(false); setEditData(null) }}
          onSave={handleSave}
        />
      )}

      {/* Pay confirm modal */}
      {confirmPay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setConfirmPay(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 slide-up"
            style={{
              background: D.surface2,
              border: `1px solid rgba(80,250,123,0.2)`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="text-center mb-5">
              <p className="text-4xl mb-3">✅</p>
              <h3 className="text-base font-bold mb-1" style={{ color: D.fg }}>Marcar como paga?</h3>
              <p className="text-sm" style={{ color: D.comment }}>
                {confirmPay.name} · <strong style={{ color: D.fg, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(confirmPay.amount)}</strong>
              </p>
            </div>
            <p className="text-xs text-center mb-4" style={{ color: D.comment }}>
              Deseja criar também um lançamento em Transações?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => confirmPayment(true)}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{ background: `rgba(80,250,123,0.15)`, color: D.green, border: `1px solid rgba(80,250,123,0.3)`, boxShadow: `0 0 16px rgba(80,250,123,0.15)` }}
              >
                ✓ Pagar e registrar gasto
              </button>
              <button
                onClick={() => confirmPayment(false)}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(68,71,90,0.5)', color: D.comment, border: '1px solid rgba(98,114,164,0.25)' }}
              >
                Apenas marcar como paga
              </button>
              <button
                onClick={() => setConfirmPay(null)}
                className="w-full py-2 text-sm font-medium"
                style={{ color: D.comment }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
