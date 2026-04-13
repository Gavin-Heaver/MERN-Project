import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api"
import axios from "axios"
import CodeInput from "../components/CodeInput"
import { ArrowLeft } from "lucide-react"

type Step = 'email' | 'reset'

export default function ForgotPassword() {
    const navigate = useNavigate()

    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSendEmail(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await api.auth.forgotPassword(email)
            setStep('reset')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to send reset email')
                : 'Failed to send reset email'
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleReset(e: React.SyntheticEvent) {
        e.preventDefault()
        if (code.length < 6) {
            setError('Please enter the full 6-digit code')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }
        if(password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }
        setError(null)
        setLoading(true)
        try {
            await api.auth.resetPassword({ token: code, newPassword: password })
            setSuccess(true)
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Reset failed')
                : 'Reset failed'
            )
            setCode('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <svg
                className='auth-bg'
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-ucf-light" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-ucf-light" />
            </svg>

            <div className="auth-content">
                <img src="/logo_stars.PNG" alt="UKNighted Logo" className="auth-logo" />

                {success ? (
                    <>
                        <h1 className="auth-title">Password reset!</h1>
                        <p className="auth-subtitle">Redirecting you to login...</p>
                    </>
                ) : step === 'email' ? (
                    <>
                        <h1 className="auth-title">Forgot Password?</h1>
                        <p className="auth-subtitle">
                            Enter your email and we'll send you a reset code
                        </p>

                        <div className="auth-form">
                            {error && <p className="auth-error">{error}</p>}

                            <form
                                onSubmit={handleSendEmail}
                                className="flex flex-col gap-4"
                            >
                                <input
                                    className="auth-input"
                                    type="email"
                                    placeholder="your@ucf.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    className="auth-button"
                                    type="submit"
                                    disabled={loading || !email}
                                >
                                    {loading ? 'Sending...' : 'Send reset code'}
                                </button>
                            </form>

                            <p>
                                Remembered it?{' '}
                                <Link
                                    to="/login"
                                    className="font-bold"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="auth-title">Reset password</h1>
                        <p className="auth-subtitle">
                            Enter the code sent to {email} and your new password
                        </p>

                        <div className="auth-form">
                            {error && <p className="auth-error">{error}</p>}

                            <form
                                onSubmit={handleReset}
                                className="flex flex-col gap-4"
                            >
                                <CodeInput onChange={setCode} disabled={loading} />

                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="New password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                />

                                <button
                                    className="auth-button"
                                    type="submit"
                                    disabled={loading || code.length < 6 || !password || !confirm}
                                >
                                    {loading ? 'Resetting...' : 'Reset password'}
                                </button>
                            </form>

                            <button
                                onClick={() => {
                                    setStep('email')
                                    setCode('')
                                    setError(null)
                                }}
                                className="auth-link"
                            >
                                <ArrowLeft /> Use a different email
                            </button>
                        </div>
                    </>
                )}
            </div>
            <p className="px-4 text-white/70">
                Check your inbox for a 6-digit verification code.
            </p>

        </div>
    )
}