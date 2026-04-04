import React, { useState, useMemo } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Dashboard    from './components/Dashboard'
import Transactions from './components/Transactions'
import Categories   from './components/Categories'
import Charts       from './components/Charts'
import Bills        from './components/Bills'
import Receitas     from './components/Receitas'
import ExpenseModal from './components/ExpenseModal'
import Header       from './components/Header'
import { getBillStatus } from './components/BillItem'

// Dracula colors
const D = {
  bg: '#282a36', surface: '#44475a', surface2: '#373948',
  comment: '#6272a4', fg: '#f8f8f2',
  purple: '#bd93f9', pink: '#ff79c6', cyan: '#8be9fd',
  green: '#50fa7b', red: '#ff5555', orange: '#ffb86c', yellow: '#f1fa8c',
}

function NavIcon({ label, icon, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 flex-1 py-2.5 transition-all relative"
    >
      <span
        className="text-xl leading-none relative transition-all"
        style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}
      >
        {icon}
        {badge > 0 && (
          <span
            className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 leading-none"
            style={{ background: D.red, color: '#fff', boxShadow: `0 0 8px ${D.red}80` }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span
        className="text-[10px] font-semibold transition-all"
        style={{ color: active ? D.purple : D.comment }}
      >
        {label}
      </span>
      {active && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
          style={{ background: D.purple, boxShadow: `0 0 8px ${D.purple}` }}
        />
      )}
    </button>
  )
}

function Inner() {
  const [tab, setTab]           = useState('dashboard')
  const [modal, setModal]       = useState(false)
  const [editData, setEditData] = useState(null)
  const [month, setMonth]       = useState(new Date().getMonth())
  const [year, setYear]         = useState(new Date().getFullYear())
  const { data } = useApp()

  const billBadge = useMemo(() =>
    (data.bills || []).filter(b => !b.paid && getBillStatus(b).urgency >= 2).length
  , [data.bills])

  const openAdd        = ()  => { setEditData(null); setModal(true) }
  const openAddIncome  = ()  => { setEditData({ type: 'income' }); setModal(true) }
  const openEdit       = (e) => { setEditData(e); setModal(true) }
  const closeModal     = ()  => { setModal(false); setEditData(null) }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto relative"
      style={{ background: D.bg }}
    >
      <Header month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />

      <main className="flex-1 pb-24 overflow-y-auto scrollbar-hide">
        {tab === 'dashboard'    && <Dashboard    month={month} year={year} onEdit={openEdit} onAdd={openAdd} goToTransactions={() => setTab('transactions')} goToBills={() => setTab('bills')} />}
        {tab === 'transactions' && <Transactions month={month} year={year} onEdit={openEdit} />}
        {tab === 'receitas'     && <Receitas     month={month} year={year} onEdit={openEdit} onAdd={openAddIncome} />}
        {tab === 'bills'        && <Bills />}
        {tab === 'categories'   && <Categories   month={month} year={year} />}
        {tab === 'charts'       && <Charts       month={month} year={year} />}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md safe-bottom z-40"
        style={{
          background: 'rgba(33,34,44,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(98,114,164,0.2)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-around px-1">
          <NavIcon label="Início"   icon="🏠" active={tab==='dashboard'}    onClick={() => setTab('dashboard')} />
          <NavIcon label="Gastos"   icon="📋" active={tab==='transactions'} onClick={() => setTab('transactions')} />

          {/* FAB */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={openAdd}
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold -mt-6 transition-all active:scale-90"
              style={{
                background: `linear-gradient(135deg, ${D.purple}, ${D.pink})`,
                color: D.bg,
                boxShadow: `0 4px 20px ${D.purple}60, 0 0 0 3px ${D.bg}`,
              }}
            >＋</button>
          </div>

          <NavIcon label="Receitas" icon="💰" active={tab==='receitas'} onClick={() => setTab('receitas')} />
          <NavIcon label="Contas"   icon="🔔" active={tab==='bills'}    onClick={() => setTab('bills')} badge={billBadge} />
        </div>
      </nav>

      {modal && <ExpenseModal initial={editData} onClose={closeModal} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
