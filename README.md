# 💰 Controle de Gastos

App PWA para controle de gastos mensais. Instala direto no Android pelo Chrome — sem app store, sem servidor, sem custo.

![Preview](https://img.shields.io/badge/PWA-Offline%20Ready-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🚀 Deploy em 5 minutos

### 1. Fork ou clone

```bash
git clone https://github.com/SEU_USUARIO/gastos-app.git
cd gastos-app
```

### 2. Ajuste o base URL

Em `vite.config.js`, altere `base` para o nome do seu repositório:

```js
base: '/gastos-app/',   // ← troque pelo nome do seu repo
```

### 3. Push para o GitHub

```bash
git add .
git commit -m "chore: initial deploy"
git push origin main
```

### 4. Ativar GitHub Pages

1. Vá em **Settings → Pages** no seu repositório
2. Em **Source** selecione **GitHub Actions**
3. Aguarde o workflow terminar (~2 min)
4. Acesse: `https://SEU_USUARIO.github.io/gastos-app/`

### 5. Instalar no Android

1. Abra o link acima no **Chrome para Android**
2. Toque no banner "Adicionar à tela inicial" **ou** menu ⋮ → "Instalar app"
3. O app abre em tela cheia, funciona offline ✅

---

## 🛠️ Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera pasta dist/
npm run preview  # preview da build
```

---

## ✨ Funcionalidades

| Tela | O que faz |
|---|---|
| **Início** | Saldo do mês, estatísticas, gráfico de pizza por categoria, evolução 6 meses, últimos lançamentos |
| **Lançamentos** | Lista completa, busca por texto, filtro por tipo e categoria, exportar CSV |
| **Categorias** | Gastos por categoria com barra de progresso, definir orçamento por categoria com alerta de estouro |
| **Gráficos** | Receitas vs. Gastos anual, saldo acumulado, gastos diários do mês, comparação com ano anterior, donut por categoria |

### Recursos extras
- 🌙 **Dark mode** — toggle manual ou segue o sistema
- 📥 **Exportar CSV** — com BOM para abrir corretamente no Excel
- 📲 **PWA instalável** — funciona offline, ícone na home screen
- 💾 **Dados locais** — tudo salvo no `localStorage`, zero dependência de servidor
- 🔄 **Deploy automático** — GitHub Actions faz build e publica a cada `push`

---

## 🗂️ Estrutura do projeto

```
gastos-app/
├── .github/workflows/deploy.yml   ← CI/CD automático
├── public/
│   ├── icon-192.png               ← Ícone PWA
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── favicon.ico
├── src/
│   ├── App.jsx                    ← Shell + navegação
│   ├── main.jsx
│   ├── index.css
│   ├── constants.js               ← Categorias, meses
│   ├── db.js                      ← localStorage + exportCSV
│   ├── context/
│   │   └── AppContext.jsx         ← Estado global (useReducer)
│   └── components/
│       ├── Header.jsx
│       ├── Dashboard.jsx
│       ├── Transactions.jsx
│       ├── Categories.jsx
│       ├── Charts.jsx
│       ├── ExpenseModal.jsx
│       └── TransactionItem.jsx
├── index.html
├── vite.config.js                 ← PWA + base URL
├── tailwind.config.js
└── package.json
```

---

## 🔮 Próximos passos (opcionais)

- [ ] Sincronização via **Firebase Firestore** (multi-dispositivo)
- [ ] **Notificações push** de lembrete diário
- [ ] Importar extrato bancário (OFX/CSV)
- [ ] Metas de economia mensais
- [ ] Relatório em PDF

---

## 📄 Licença

MIT — use, modifique e distribua livremente.
