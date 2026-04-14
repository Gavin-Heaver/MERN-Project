import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PeoplePage from './pages/PeoplePage'
import ChatsPage from './pages/ChatsPage'
import AccountPage from './pages/AccountPage'
import Navbar from './components/Navbar'
import VerifyEmail from './pages/VerifyEmail'
import SetupPage from './pages/SetupPage'
import MessagePage from './pages/MessagePage'
import ForgotPassword from './pages/ForgotPassword'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  return token ?<>{children}</> : <Navigate to="/login" replace />
}

function SetupRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { token, user } = useAuth()
  if(!token) return <>{children}</>

  if (
      !user?.basicInfo?.basicInfoComplete
      || !user.profile.profileComplete
      || !user.preferences.preferencesComplete
  ) {

  return (
    <Route path="/setup" element={
      <SetupRoute><SetupPage /></SetupRoute>
    } />
  )
  }

  return (
    <>
      <Navbar />
      <main className='flex flex-col flex-1 pb-16 md:pb-0 md:pt-16 overflow-hidden'>{children}</main>
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
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/setup" element={
          <SetupRoute><SetupPage /></SetupRoute>
        } />

        <Route path='/*' element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Routes>
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/messages" element={<ChatsPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/chat/:chatId" element={<MessagePage />} />
              </Routes>
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}