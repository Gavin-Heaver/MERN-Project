import { useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import axios from "axios"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSendEmail(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await api.auth.forgotPassword(email)
            setSuccess(true)
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to send reset email')
                : 'Failed to send reset email'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">

            <svg
                className='absolute inset-0 w-full h-full pointer-events-none z-0'
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/20" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/20" />
            </svg>

            <div className="relative z-10 w-full flex flex-col items-center">
                <img src="/logo_stars.PNG" alt="UKnighted Logo" className="w-48 h-48 object-contain mb-2" />

                {success ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-success" />
                        </div>
                        <h1 className="text-4xl font-bold text-brand-500 tracking-wide mb-2">
                            Check your email
                        </h1>
                        <p className="text-foreground/80 text-center mb-8 px-8 max-w-md">
                            If an account exists for <span className="font-semibold">{email}</span>, we've sent you a password reset link.
                        </p>
                        <Link
                            to="/login"
                            className="text-brand-500 hover:text-brand-400 font-medium"
                        >
                            <div className="flex flex-row">
                                <ArrowLeft /> Back to login
                            </div>
                        </Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-5xl font-bold text-brand-500 tracking-wide mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-foreground/80 text-center mb-8 px-8">
                            Enter your email and we'll send you a reset code
                        </p>

                        <div className="w-full max-w-sm px-8 flex flex-col gap-4">
                            {error &&
                                <p className="text-error text-center text-sm bg-error/10 border border-error rounded-lg p-3">
                                    {error}
                                </p>
                            }

                            <form
                                onSubmit={handleSendEmail}
                                className="flex flex-col gap-4"
                            >
                                <input
                                    type="email"
                                    placeholder="your@ucf.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="px-5 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-brand-500 transition-colors text-base w-full"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="py-3 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
                                >
                                    {loading ? 'Sending...' : 'Send reset link'}
                                </button>
                            </form>

                            <p className="text-center text-muted text-sm">
                                Remembered it?{' '}
                                <Link
                                    to="/login"
                                    className="text-brand-500 hover:text-brand-400 font-bold"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}