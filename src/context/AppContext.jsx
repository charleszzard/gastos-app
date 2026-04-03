import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { load, save } from '../db'

const AppContext = createContext(null)

const initialState = load()

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) }
    case 'SET_BUDGET':
      return { ...state, budgets: { ...state.budgets, [action.category]: action.amount } }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [data, dispatch] = useReducer(reducer, initialState)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => { save(data) }, [data])
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const addExpense   = (exp) => dispatch({ type: 'ADD_EXPENSE',    payload: { ...exp, id: Date.now().toString() } })
  const updateExpense= (exp) => dispatch({ type: 'UPDATE_EXPENSE', payload: exp })
  const deleteExpense= (id)  => dispatch({ type: 'DELETE_EXPENSE', id })
  const setBudget    = (cat, amt) => dispatch({ type: 'SET_BUDGET', category: cat, amount: amt })

  return (
    <AppContext.Provider value={{ data, addExpense, updateExpense, deleteExpense, setBudget, darkMode, setDarkMode }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
