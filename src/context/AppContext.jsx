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

    // Bills
    case 'ADD_BILL':
      return { ...state, bills: [action.payload, ...state.bills] }
    case 'UPDATE_BILL':
      return { ...state, bills: state.bills.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'DELETE_BILL':
      return { ...state, bills: state.bills.filter(b => b.id !== action.id) }
    case 'PAY_BILL': {
      const updatedBills = state.bills.map(b =>
        b.id === action.id ? { ...b, paid: true, paidAt: action.paidAt } : b
      )
      if (action.createExpense) {
        return {
          ...state,
          bills: updatedBills,
          expenses: [action.createExpense, ...state.expenses]
        }
      }
      return { ...state, bills: updatedBills }
    }
    case 'UNMARK_PAID':
      return { ...state, bills: state.bills.map(b => b.id === action.id ? { ...b, paid: false, paidAt: null } : b) }

    // Savings Goal
    case 'SET_SAVINGS_GOAL':
      return { ...state, savingsGoal: action.amount }

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

  const addExpense    = (exp) => dispatch({ type: 'ADD_EXPENSE',    payload: { ...exp, id: Date.now().toString() } })
  const updateExpense = (exp) => dispatch({ type: 'UPDATE_EXPENSE', payload: exp })
  const deleteExpense = (id)  => dispatch({ type: 'DELETE_EXPENSE', id })
  const setBudget     = (cat, amt) => dispatch({ type: 'SET_BUDGET', category: cat, amount: amt })

  const addBill    = (bill) => dispatch({ type: 'ADD_BILL',    payload: { ...bill, id: Date.now().toString(), paid: false } })
  const updateBill = (bill) => dispatch({ type: 'UPDATE_BILL', payload: bill })
  const deleteBill = (id)   => dispatch({ type: 'DELETE_BILL', id })
  const payBill    = (id, createExpense) => {
    const paidAt = new Date().toISOString().split('T')[0]
    const expense = createExpense ? { ...createExpense, id: Date.now().toString() } : null
    dispatch({ type: 'PAY_BILL', id, paidAt, createExpense: expense })
  }
  const unmarkPaid = (id) => dispatch({ type: 'UNMARK_PAID', id })
  const setSavingsGoal = (amount) => dispatch({ type: 'SET_SAVINGS_GOAL', amount })

  return (
    <AppContext.Provider value={{
      data,
      addExpense, updateExpense, deleteExpense, setBudget,
      addBill, updateBill, deleteBill, payBill, unmarkPaid,
      setSavingsGoal,
      darkMode, setDarkMode
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
