import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"
import { useEffect, useState } from "react"
import type { Post, User } from "../types"
import { api } from "../api"
import axios from "axios"

export default function FeedPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    useSocket()

    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [posting, setPosting] = useState(false)
    const [postError, setPostError] = useState<string | null>(null)

    useEffect(() => {
        api.posts.getAll()
            .then(setPosts)
            .catch(() => setError('Failed to load posts'))
            .finally(() => setLoading(false))
    }, [])

    async function handleCreate(e: React.SyntheticEvent) {
        e.preventDefault()
        setPostError(null)
        setPosting(true)
        try {
            const newPost = await api.posts.create({ title, body })
            setPosts(prev => [newPost, ...prev])
            setTitle('')
            setBody('')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setPostError(err.response?.data?.message ?? 'Failed to create post')
            } else {
                setPostError('Failed to create post')
            }
        } finally {
            setPosting(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            await api.posts.delete(id)
            setPosts(prev => prev.filter(p => p._id !== id))
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message ?? 'Failed to delete post')
            }
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            <div>
                <h1>Campus Board</h1>
                <div className="flex flex-col">
                    <span>Hi, {user?.basicInfo?.firstName}</span>
                    <button onClick={() => {logout(); navigate('/login') }} className="">Log out</button>
                </div>
            </div>

            <form onSubmit={handleCreate} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '20em' }}>
                <h2>New post</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Post something!"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    required
                />
                {postError && <p style={{ color: 'red' }}>{postError}</p>}
                <button type="submit" disabled={posting}>
                    {posting ? 'Posting...' : 'Post'}
                </button>
            </form>

            <hr />

            {posts.length === 0
                ? <p>No posts yet.</p>
                : posts.map(post => (
                    <PostView key={post._id} user={user} post={post} onDelete={handleDelete} />
                ))
            }
        </div>
    )
}

interface PostViewProps {
    user: User | null
    post: Post
    onDelete: (id: string) => void
}

function PostView({ user, post, onDelete }: PostViewProps) {

    return(
        <div>
            <div className="border rounded-xl m-6" key={post._id}>
                <h2 className="text-3xl font-bold">{post.title}</h2>
                <p>{post.body}</p>
                <small>by {post.author.displayName}</small>

                {post.author._id === user?.id && (
                    <div>
                        <div className="border-solid h-1 bg-white rounded m-2" />
                        <button className="border-solid border-gray-500 rounded" onClick={() => onDelete(post._id)}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}