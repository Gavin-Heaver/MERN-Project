import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"

export default function RegisterPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { token, user } = await api.auth.register({ email, password, displayName })
            login(token, user)
            navigate('/')
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
        <div>
            <h1>Create account</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                <input type="email" placeholder="id@ucf.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    )
}