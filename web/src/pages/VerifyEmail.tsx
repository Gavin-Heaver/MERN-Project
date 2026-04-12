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
    const [error, setError] = useState<string|null>(null)
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
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Verification failed')
                : 'Incorrect code'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className='text-white p-4'>Verify Email</h1>
            <p className="px-4 text-white/70">
                Check your inbox for a 6-digit verification code.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
                <input
                    type="email"
                    placeholder="your@ucf.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="text"
                    placeholder="6-digit code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={6}
                    required
                />
                {error && <p className='text-red-400 text-sm'>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    )
}