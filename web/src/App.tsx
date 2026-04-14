import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PeoplePage from './pages/PeoplePage'
import ChatsPage from './pages/ChatsPage'
import AccountPage from './pages/AccountPage'
import VerifyEmail from './pages/VerifyEmail'
import SetupPage from './pages/SetupPage'
import MessagePage from './pages/MessagePage'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/setup" element={
              <ProtectedRoute requireSetup={false}>
                <SetupPage />
              </ProtectedRoute>
            } />

            <Route path="/people" element={<ProtectedRoute>
              <PeoplePage />
            </ProtectedRoute>} />
            <Route path="/chats" element={<ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute>
              <MessagePage />
            </ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/people" replace />} />
            <Route path="*" element={<Navigate to="/people" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}