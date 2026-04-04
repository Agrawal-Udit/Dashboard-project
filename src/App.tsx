import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeSync } from './components/layout/ThemeSync'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
