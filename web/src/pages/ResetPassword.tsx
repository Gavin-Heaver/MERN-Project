import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import axios from "axios";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token')
        }
    }, [token])

    async function handleReset(e: React.SyntheticEvent) {
        e.preventDefault()

        if (!token) {
            setError('Invalid reset token')
            return
        }

        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters')
            return
        }

        setError(null)
        setLoading(true)

        try {
            await api.auth.resetPassword({ token, newPassword: password })
            setSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data.message ?? 'Reset failed')
                : 'Reset failed'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/20" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/20" />
            </svg>

            <div className="relative z-10 w-full flex flex-col items-center">
                <img 
                    src="/logo_stars.PNG" 
                    alt="UKnighted Logo" 
                    className="w-48 h-48 object-contain mb-2" 
                />

                {success ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h1 className="text-4xl font-bold text-brand-500 tracking-wide mb-2">
                            Password reset!
                        </h1>
                        <p className="text-foreground/80 text-center mb-8 px-8">
                            Redirecting you to login...
                        </p>
                    </>
                ) : !token || error === 'Invalid or missing reset token' ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-error" />
                        </div>
                        <h1 className="text-4xl font-bold text-brand-500 tracking-wide mb-2">
                            Invalid Link
                        </h1>
                        <p className="text-foreground/80 text-center mb-8 px-8 max-w-md">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link 
                            to="/forgot-password"
                            className="text-brand-500 hover:text-brand-400 font-medium"
                        >
                            Request a new reset link <ArrowRight />
                        </Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-5xl font-bold text-brand-500 tracking-wide mb-2">
                            Reset Password
                        </h1>
                        <p className="text-foreground/80 text-center mb-8 px-8">
                            Enter your new password
                        </p>

                        <div className="w-full max-w-sm px-8 flex flex-col gap-4">
                            {error && (
                                <p className="text-error text-center text-sm bg-error/10 border border-error rounded-lg p-3">
                                    {error}
                                </p>
                            )}

                            <form onSubmit={handleReset} className="flex flex-col gap-4">
                                <input
                                    type="password"
                                    placeholder="New password (min. 8 characters)"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={4}
                                    className="px-5 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-brand-500 transition-colors text-base w-full"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    className="px-5 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-brand-500 transition-colors text-base w-full"
                                />

                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirm}
                                    className="py-3 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
                                >
                                    {loading ? 'Resetting...' : 'Reset password'}
                                </button>
                            </form>

                            <p className="text-center text-muted text-sm">
                                <Link to="/login" className="text-brand-500 hover:text-brand-400 font-bold">
                                    Back to login
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}