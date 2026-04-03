const KEY = 'gastos_v2'

const defaults = () => ({ expenses: [], budgets: {} })

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults()
  } catch {
    return defaults()
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Falha ao salvar dados', e)
  }
}

export function exportCSV(expenses) {
  const header = 'Data,Descrição,Categoria,Tipo,Valor'
  const rows = expenses.map(e => {
    const date = new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')
    const amt = e.type === 'income' ? e.amount : -e.amount
    return `"${date}","${e.desc}","${e.category}","${e.type === 'income' ? 'Receita' : 'Gasto'}","${amt.toFixed(2)}"`
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gastos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
