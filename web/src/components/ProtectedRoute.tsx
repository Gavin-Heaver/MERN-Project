import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface ProtectedRouteProps {
    children: React.ReactNode
    requireSetup?: boolean
}

export default function ProtectedRoute({ children, requireSetup = true }: ProtectedRouteProps) {
    const { user, token } = useAuth()
    const location = useLocation()

    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requireSetup && (
        !user.basicInfo.basicInfoComplete
        || !user.profile.profileComplete
        || !user.preferences.preferencesComplete
    )) {
        return <Navigate to="/setup" replace />
    }

    return (
        <>{children}</>
    )
}