import React, { useState } from "react"
import { api } from "../api"
import axios from "axios"

export default function VerifyEmail() {
            
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")
    const [error, setError] = useState<null|string>(null)

        async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        // try {
        //     await api.auth.verifyEmail({ email, code })
        //     navigate('/account-setup')
        // } catch (err) {
        //     if (axios.isAxiosError(err)) {
        //         setError(err.response?.data?.message ?? 'Verification failed')
        //     } else {
        //         setError('Incorrect code!')
        //     }
        // } finally {
        //     setLoading(false)
        // }
    }

    return (
        <div>
            <h1 className='text-white p-4'>Verify Email</h1>
            <p>Check your inbox for a verification email and enter the given 6-digit code to verify your account.</p>

            <form onSubmit={handleSubmit}>
                <input 
                    type="text" placeholder="6-digit code" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    required 
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    )
}