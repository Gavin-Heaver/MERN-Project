import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"

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
            navigate('/verify-email', { state: { email } })
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
        <div>
            <h1>Create account</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="id@ucf.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
            <p>Need to verify your email? <Link to="/verify-email">Verify Email</Link></p>
        </div>
    )
}