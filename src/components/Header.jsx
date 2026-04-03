import React from 'react'
import { MONTHS } from '../constants'
import { useApp } from '../context/AppContext'

export default function Header({ month, year, onPrev, onNext }) {
  const { darkMode, setDarkMode } = useApp()

  return (
    <header
      className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(33,34,44,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(98,114,164,0.25)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-drac-glow-purple"
          style={{ background: 'linear-gradient(135deg, #bd93f9, #ff79c6)' }}
        >
          <span style={{ color: '#282a36', fontSize: '11px', fontWeight: 800 }}>R$</span>
        </div>
        <div>
          <span className="text-sm font-bold" style={{ color: '#f8f8f2' }}>Meus Gastos</span>
          <span
            className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(189,147,249,0.15)', color: '#bd93f9' }}
          >
            PRO
          </span>
        </div>
      </div>

      {/* Month navigator */}
      <div
        className="flex items-center gap-1 rounded-xl px-1 py-0.5"
        style={{ background: 'rgba(68,71,90,0.6)', border: '1px solid rgba(98,114,164,0.3)' }}
      >
        <button
          onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all hover:bg-white/10 active:scale-90"
          style={{ color: '#bd93f9' }}
        >‹</button>
        <span
          className="text-xs font-semibold min-w-[96px] text-center"
          style={{ color: '#f8f8f2' }}
        >
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all hover:bg-white/10 active:scale-90"
          style={{ color: '#bd93f9' }}
        >›</button>
      </div>

      {/* Dark mode toggle — always dark in Dracula, shows sun to hint */}
      <button
        onClick={() => setDarkMode(d => !d)}
        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 active:scale-90"
        style={{ color: '#f1fa8c' }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
