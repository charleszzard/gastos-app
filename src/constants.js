export const CATEGORIES = [
  { id: 'food',          name: 'Alimentação',  icon: '🍽️', color: '#1d9e75', bg: '#e1f5ee' },
  { id: 'transport',     name: 'Transporte',   icon: '🚗', color: '#378add', bg: '#e6f1fb' },
  { id: 'housing',       name: 'Moradia',      icon: '🏠', color: '#ba7517', bg: '#faeeda' },
  { id: 'health',        name: 'Saúde',        icon: '💊', color: '#e24b4a', bg: '#fcebeb' },
  { id: 'entertainment', name: 'Lazer',         icon: '🎬', color: '#7f77dd', bg: '#eeedfe' },
  { id: 'education',     name: 'Educação',     icon: '📚', color: '#d4537e', bg: '#fbeaf0' },
  { id: 'shopping',      name: 'Compras',      icon: '🛒', color: '#ef9f27', bg: '#faeeda' },
  { id: 'other',         name: 'Outros',       icon: '💡', color: '#888780', bg: '#f1efe8' },
]

export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7]
