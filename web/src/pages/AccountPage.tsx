import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <div>
            <h1>Account Page</h1>
            <button
                onClick={() => {
                    logout();
                    navigate('/login')
                }}
            >
                Log out
            </button>
        </div>
    )
}