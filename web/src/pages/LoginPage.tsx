import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"

const RED = '#aa3947'

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
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* Background triangles */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* top left */}
            <polygon points="0,0 400,0 0,400" fill={`${RED}55`} />
            {/* bottom right large */}
            <polygon points="1000,1000 1000,400 800,1000" fill={`${RED}55`} />
        </svg>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Logo */}
                <img
                    src="/logo_stars.PNG"
                    alt="UKnighted Logo"
                    style={{
                        width: '300px',
                        height: '300px',
                        objectFit: 'contain',
                        marginBottom: '0.5rem'
                    }}
                />

                {/* App Name */}
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: RED,
                    letterSpacing: '0.025em',
                    marginBottom: '2rem'
                }}>
                    UKnighted
                </h1>

                {/* Card */}
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>

                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="email"
                            placeholder="id@ucf.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '25px',
                                border: `1px solid ${RED}`,
                                fontSize: '1rem',
                                outline: 'none',
                                width: '100%',
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '25px',
                                border: `1px solid ${RED}`,
                                fontSize: '1rem',
                                outline: 'none',
                                width: '100%',
                            }}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '25px',
                                border: 'none',
                                backgroundColor: RED,
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                width: '100%',
                            }}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: RED }}>
                        Don't have an account? <Link to="/register" style={{ color: RED, fontWeight: 'bold' }}>Sign up</Link>
                    </p>

                </div>
            </div>
        </div>
    )
}