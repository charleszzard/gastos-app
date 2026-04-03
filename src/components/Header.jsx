import React from 'react'
import { MONTHS } from '../constants'
import { useApp } from '../context/AppContext'

export default function Header({ month, year, onPrev, onNext }) {
  const { darkMode, setDarkMode } = useApp()

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
      <span className="text-base font-semibold text-gray-800 dark:text-gray-100">💰 Meus Gastos</span>

      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">‹</button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[110px] text-center">
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">›</button>
      </div>

      <button
        onClick={() => setDarkMode(d => !d)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
