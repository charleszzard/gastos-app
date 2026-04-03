import React, { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Dashboard    from './components/Dashboard'
import Transactions from './components/Transactions'
import Categories   from './components/Categories'
import Charts       from './components/Charts'
import ExpenseModal from './components/ExpenseModal'
import Header       from './components/Header'

function NavIcon({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-all ${
        active ? 'text-brand-600' : 'text-gray-400'
      }`}
    >
      <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-brand-600' : 'text-gray-400'}`}>{label}</span>
    </button>
  )
}

function Inner() {
  const [tab, setTab]         = useState('dashboard')
  const [modal, setModal]     = useState(false)
  const [editData, setEditData] = useState(null)
  const [month, setMonth]     = useState(new Date().getMonth())
  const [year, setYear]       = useState(new Date().getFullYear())

  const openAdd  = ()   => { setEditData(null); setModal(true) }
  const openEdit = (e)  => { setEditData(e);    setModal(true) }
  const closeModal = () => { setModal(false); setEditData(null) }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative" style={{ background: '#faf8ff' }}>
      <Header month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />

      <main className="flex-1 pb-24 overflow-y-auto scrollbar-hide">
        {tab === 'dashboard'    && <Dashboard    month={month} year={year} onEdit={openEdit} onAdd={openAdd} goToTransactions={() => setTab('transactions')} />}
        {tab === 'transactions' && <Transactions month={month} year={year} onEdit={openEdit} />}
        {tab === 'categories'   && <Categories   month={month} year={year} />}
        {tab === 'charts'       && <Charts       month={month} year={year} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-violet-100 safe-bottom z-40 shadow-[0_-4px_20px_rgba(124,58,237,0.08)]">
        <div className="flex items-center justify-around px-2">
          <NavIcon label="Início"      icon="🏠" active={tab==='dashboard'}    onClick={() => setTab('dashboard')} />
          <NavIcon label="Lançamentos" icon="📋" active={tab==='transactions'} onClick={() => setTab('transactions')} />
          {/* FAB center */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={openAdd}
              className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl -mt-5 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
            >＋</button>
          </div>
          <NavIcon label="Categorias"  icon="📊" active={tab==='categories'}   onClick={() => setTab('categories')} />
          <NavIcon label="Gráficos"    icon="📈" active={tab==='charts'}       onClick={() => setTab('charts')} />
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
