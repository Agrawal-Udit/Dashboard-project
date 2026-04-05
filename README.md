# FinanceHub - Modern Finance Dashboard

A beautifully animated, fully responsive finance dashboard built with React, TypeScript, and modern web technologies.

![Finance Dashboard](https://via.placeholder.com/800x400?text=Finance+Dashboard)

## ✨ Features

### Core Dashboard

- **📊 KPI Cards** - Animated summary cards showing Total Balance, Income, and Expenses with counting animations
- **📈 Balance Trend Chart** - Interactive area chart showing cumulative balance over time
- **🍩 Spending Breakdown** - Donut chart visualizing expenses by category
- **💡 Smart Insights** - AI-style insights including top spending category, monthly comparison, and savings rate

### Transactions Management

- **📝 Full CRUD** - Add, edit, and view transactions (Admin role required for modifications)
- **🔍 Advanced Filtering** - Filter by type (income/expense), category, and search by description
- **↕️ Sorting** - Sort by date, amount, or category with visual indicators
- **📤 Export** - Download transactions as JSON or CSV

### Insights Page

- **📊 Monthly Comparison** - Bar chart comparing income vs expenses by month
- **🏆 Achievements** - Gamified badges based on financial habits
- **📉 Category Breakdown** - Animated progress bars showing spending distribution

### Settings Page

- **🌓 Dark Mode** - Toggle between light and dark themes with smooth transitions
- **📊 Data Management** - Export data and reset to demo transactions
- **👤 Profile Overview** - View current role and account information

### Role-Based Access Control (RBAC)

- **👁️ Viewer Role** - Can view all data and charts
- **🔐 Admin Role** - Can add and edit transactions
- Switch roles via the header dropdown for demonstration

## 🎨 Design & Animations

### Visual Features

- **Glassmorphism** - Modern frosted glass card effects
- **Gradient Backgrounds** - Beautiful gradient decorations and accents
- **Smooth Transitions** - Page transitions, hover effects, and micro-interactions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### Animation Highlights

- Staggered card entrance animations
- Number counting animations on KPI values
- Interactive hover effects with scale and shadow changes
- Animated navigation indicator that slides between menu items
- Chart animations with smooth data transitions
- Row animations in transaction tables

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Production-ready animations
- **Recharts** - Composable charting library
- **Zustand** - Lightweight state management with persistence
- **React Router 7** - Client-side routing
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful consistent icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Role-based access components
│   ├── dashboard/     # KPI cards, charts, insights
│   ├── layout/        # App layout, header, sidebar
│   ├── transactions/  # Transaction table, filters, forms
│   └── ui/            # Reusable UI components (Button, Card, Modal)
├── data/              # Mock transaction data
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── store/             # Zustand state management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions and motion configs
```

## 🎯 Assignment Requirements Fulfilled

| Requirement              | Status | Implementation                               |
| ------------------------ | ------ | -------------------------------------------- |
| Dashboard Overview       | ✅     | KPI cards, balance trend, spending breakdown |
| Time-based Visualization | ✅     | Balance trend area chart                     |
| Category Visualization   | ✅     | Spending pie chart + bar chart               |
| Transaction List         | ✅     | Full table with mobile cards                 |
| Filtering & Search       | ✅     | Type, category, and text search              |
| Sorting                  | ✅     | Date, amount, category columns               |
| Role-Based UI            | ✅     | Viewer/Admin toggle with UI changes          |
| Insights                 | ✅     | Top category, monthly comparison, ratios     |
| State Management         | ✅     | Zustand with persistence                     |
| Dark Mode                | ✅     | Full theme support                           |
| Responsive Design        | ✅     | Mobile-first approach                        |
| Export Functionality     | ✅     | JSON and CSV export                          |
| Animations               | ✅     | Framer Motion throughout                     |
| Empty States             | ✅     | Graceful handling with illustrations         |

## 📝 Design Decisions

1. **Glassmorphism Cards** - Chose a modern glass effect for cards to create depth without heavy shadows
2. **Gradient Accents** - Used subtle gradients to add visual interest while maintaining professionalism
3. **Staggered Animations** - Elements animate in sequence for a polished, intentional feel
4. **Mobile-First** - Transaction cards on mobile, tables on desktop for optimal UX
5. **Persistent State** - User preferences (theme, role) persist across sessions

## 🔮 Potential Enhancements

- [ ] Backend API integration
- [ ] Real authentication
- [ ] Budget goals and tracking
- [ ] Recurring transactions
- [ ] Multiple currencies
- [ ] Data visualization customization
- [ ] Notification system
- [ ] Report generation (PDF)

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own dashboard.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
