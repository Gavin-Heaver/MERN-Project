import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import axios from "axios"

export default function VerifyEmail() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const stateEmail = (location.state as { email?: string })?.email ?? ''
    const [email, setEmail] = useState(stateEmail)
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { token, user } = await api.auth.verify({ email, verificationCode: code })
            login(token, user)
            navigate('/setup')
        } catch (err) {
            setError(
                axios.isAxiosError(err)
                    ? (err.response?.data?.message ?? 'Verification failed')
                    : 'Incorrect code'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">

            {/* Background triangles */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/30" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/30" />
            </svg>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-background/80 backdrop-blur border border-border rounded-xl p-8 shadow-lg flex flex-col gap-4">

                <h1 className="text-3xl font-bold text-foreground text-center">
                    Verify Email
                </h1>

                <p className="text-muted text-center text-sm">
                    Check your inbox for a 6-digit verification code.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        type="email"
                        placeholder="your@ucf.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-background border border-border rounded-md px-4 py-2 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />

                    <input
                        type="text"
                        placeholder="6-digit code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        maxLength={6}
                        required
                        className="bg-background border border-border rounded-md px-4 py-2 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />

                    {error && (
                        <p className="text-error text-sm text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-500 hover:bg-brand-400 text-white font-semibold py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                </form>

            </div>

        </div>
    )
}