import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
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

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if(!token) return <>{children}</>
  return (
    <>
      <Navbar />
      <main className='pb-16'>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/account-setup" element={<AccountSetup />} />

        <Route path='/*' element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Routes>
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Routes>
            </AuthenticatedLayout>
          </PrivateRoute>
        } />

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}