import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"
import SlogansView from "../components/SlogansView"

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { token, user } = await api.auth.login({ email, password })
            login(token, user)
            if (!user.basicInfo?.basicInfoComplete) {
                navigate('/setup')
            } else {
                navigate('/people')
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'Login failed')
            } else {
                setError('Login failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background triangles */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
            {/* top left */}
            <polygon
                points="0,0 400,0 0,400"
                className="fill-brand-500/30"
            />
            {/* bottom right large */}
            <polygon
                points="1000,1000 1000,400 800,1000"
                className="fill-brand-500/30"
            />
        </svg>

            {/* Content */}
            <div className="relative z-10 w-full flex flex-col items-center">

                {/* Logo */}
                <img
                    src="/logo_stars.webp"
                    alt="UKnighted Logo"
                    fetchPriority="high"
                    decoding="async"
                    width={400}
                    height={400}
                    className="w-48 h-48 object-contain mb-2"
                />

                {/* App Name */}
                <h1 className="text-5xl font-bold text-brand-500 tracking-wide mb-4">
                    UKnighted
                </h1>

                <SlogansView />

                <div className="w-full max-w-sm px-8 flex flex-col gap-4">

                    {error && (
                        <p className="text-error text-center text-sm bg-error/10 border border-error rounded-lg p-3">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="id@ucf.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="px-5 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-brand-500 transition-colors text-base w-full"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="px-5 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-brand-500 transition-colors text-base w-full"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="py-3 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <p className="text-center text-muted text-sm">
                        Don't have an account? <Link to="/register" className="text-brand-500 hover:text-brand-400 font-bold">
                            Sign up
                        </Link>
                    </p>

                    <p className="text-center">
                        <Link
                            to="/forgot-password"
                            className="text-subtle text-sm hover:text-muted transition-colors"
                        >
                            Forgot password
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}