import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"
import { useEffect, useState } from "react"
import type { Post } from "../types"
import { api } from "../api"

export default function FeedPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    useSocket()

    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        api.posts.getAll()
            .then(setPosts)
            .catch(() => setError('Failed to load posts'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div>
            <div>
                <h1>Campus Board</h1>
                <span>Hi, {user?.displayName}</span>
                <button onClick={() => {logout(); navigate('/login') }}>Log out</button>
            </div>
            {posts.length === 0
                ? <p>No posts yet.</p>
                : posts.map(post => (
                    <div key={post._id}>
                        <h2>{post.title}</h2>
                        <p>{post.body}</p>
                        <small>by {post.author.displayName}</small>
                    </div>
                ))
            }
        </div>
    )
}