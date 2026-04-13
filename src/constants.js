// Categorias de Despesas
export const CATEGORIES = [
  { id: 'food',          name: 'Alimentação',  icon: '🍽️', color: '#1d9e75', bg: '#e1f5ee' },
  { id: 'transport',     name: 'Transporte',   icon: '🚗', color: '#378add', bg: '#e6f1fb' },
  { id: 'housing',       name: 'Moradia',      icon: '🏠', color: '#ba7517', bg: '#faeeda' },
  { id: 'health',        name: 'Saúde',        icon: '💊', color: '#e24b4a', bg: '#fcebeb' },
  { id: 'entertainment', name: 'Lazer',        icon: '🎬', color: '#7f77dd', bg: '#eeedfe' },
  { id: 'education',     name: 'Educação',     icon: '📚', color: '#d4537e', bg: '#fbeaf0' },
  { id: 'shopping',      name: 'Compras',      icon: '🛒', color: '#ef9f27', bg: '#faeeda' },
  { id: 'other',         name: 'Outros',       icon: '💡', color: '#888780', bg: '#f1efe8' },
]

// Categorias de Receitas
export const INCOME_CATEGORIES = [
  { id: 'salary',      name: 'Salário',       icon: '💼', color: '#50fa7b', bg: '#e0fce8' },
  { id: 'freelance',   name: 'Freelance',     icon: '💻', color: '#8be9fd', bg: '#e0f8fd' },
  { id: 'investment',  name: 'Investimento',  icon: '📈', color: '#bd93f9', bg: '#ede8fd' },
  { id: 'gift',        name: 'Presente',      icon: '🎁', color: '#ff79c6', bg: '#fde8f5' },
  { id: 'rental',      name: 'Aluguel',       icon: '🏘️', color: '#ffb86c', bg: '#fdf3e0' },
  { id: 'refund',      name: 'Reembolso',     icon: '↩️', color: '#1d9e75', bg: '#e1f5ee' },
  { id: 'bonus',       name: 'Bônus',         icon: '🏆', color: '#f1fa8c', bg: '#fdfde0' },
  { id: 'income_other',name: 'Outros',        icon: '💰', color: '#6272a4', bg: '#eceef8' },
]

export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const getCat = (id, type, customCategories = []) => {
  const all = [...CATEGORIES, ...INCOME_CATEGORIES, ...customCategories]
  return all.find(c => c.id === id) || (type === 'income' ? INCOME_CATEGORIES[7] : CATEGORIES[7])
}
