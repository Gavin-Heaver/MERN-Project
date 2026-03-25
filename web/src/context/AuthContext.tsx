import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode}) {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('token')
    )
    const [user, setUser] = useState<User | null> (() => {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })

    function login(token: string, user: User) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}