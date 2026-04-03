import React from 'react'
import { MONTHS } from '../constants'
import { useApp } from '../context/AppContext'

export default function Header({ month, year, onPrev, onNext }) {
  const { darkMode, setDarkMode } = useApp()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-violet-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          <span className="text-white text-xs font-bold">R$</span>
        </div>
        <span className="text-base font-bold text-gray-800">Meus Gastos</span>
      </div>

      <div className="flex items-center gap-1 bg-violet-50 rounded-2xl px-2 py-1 border border-violet-100">
        <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-xl text-violet-500 hover:bg-white transition-colors text-sm font-bold">‹</button>
        <span className="text-xs font-semibold text-violet-700 min-w-[100px] text-center">
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-xl text-violet-500 hover:bg-white transition-colors text-sm font-bold">›</button>
      </div>

      <button
        onClick={() => setDarkMode(d => !d)}
        className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-50 border border-violet-100 text-gray-500 hover:bg-violet-100 transition-colors"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
