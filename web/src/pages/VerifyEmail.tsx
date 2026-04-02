import { useState } from "react"
import { api } from "../api"

export default function VerifyEmail() {
            
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")
    const [error, setError] = useState(null)

    async function handleSubmit(e: React.SyntheticEvent) {
        // e.preventDefault()
        // setError(null)
        // setLoading(true)
        // try {
        //     const { token, user } = await api.auth.verifyEmail({ email, code })
        //     login(token, user)
        //     navigate('/')
        // } catch (err) {
        //     if (axios.isAxiosError(err)) {
        //         setError(err.response?.data?.message ?? 'Login failed')
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
                    type="email" placeholder="6-digit code" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    required 
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    )
}