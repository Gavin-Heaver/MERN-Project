import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import PeoplePage from './pages/PeoplePage'
import MessagesPage from './pages/MessagesPage'
import AccountPage from './pages/AccountPage'
import Navbar from './components/Navbar'
import VerifyEmail from './pages/VerifyEmail'
import AccountSetup from './pages/AccountSetup'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  return token ?<>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="pb-16 md:pt-16">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/account-setup" element={<AccountSetup />} />

          <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}