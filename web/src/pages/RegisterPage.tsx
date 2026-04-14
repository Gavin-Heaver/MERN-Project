import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"

const RED = '#aa3947'

export default function RegisterPage() {
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
            await api.auth.register({ email, password })
            navigate('/verify-email', { state: email })
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'Registration failed')
            } else {
                setError('Registration failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background triangles */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0,0 400,0 0,400" fill={`${RED}33`} />
                <polygon points="1000,1000 1000,400 800,1000" fill={`${RED}33`} />
            </svg>

            {/* Content */}
            <div className="relative z-10 w-full flex flex-col items-center">

                {/* Logo */}
                <img
                    src="/logo_stars.PNG"
                    alt="UKnighted Logo"
                    className="w-48 h-48 object-contain mb-2"
                />

                {/* App Name */}
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: RED,
                    letterSpacing: '0.005em',
                    marginBottom: '2rem'
                }}>
                    Ready to look for love?
                </h1>

                {/* Card */}
                <div className="w-full max-w-sm px-8 flex flex-col gap-4">

                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="id@ucf.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="px-5 py-3 rounded-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:border-red-800 text-base w-full"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="px-5 py-3 rounded-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:border-red-800 text-base w-full"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: RED }}
                            className="py-3 rounded-full text-white text-base font-bold w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: RED }} className="font-bold">Log in</Link>
                    </p>

                    <p className="text-center">
                        <Link to="/verify-email" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
                            Need to verify your email?
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}