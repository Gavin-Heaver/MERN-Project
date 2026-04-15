import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { Conversation } from "../types"
import axios from "axios"

export default function ChatsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [chats, setChats] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<null | string>(null)

    useEffect(() => {
        api.messages.getConversations()
            .then(setChats)
            .catch(err => {
                const errorMsg = 'Failed to load chats'
                setError(axios.isAxiosError(err) ? (err.response?.data ?? errorMsg) : errorMsg)
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-muted">Loading chats...</p>
        </div>
    )

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-error">{error}</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">

            {/* Background triangles */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/30" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/30" />
            </svg>

            {/* Header */}
            <div className="relative z-10 px-4 py-8 border-b border-border">
                <h1>
                    Messages
                </h1>
            </div>

            {chats.length === 0 ? (
                <div className="relative z-10 flex flex-col items-center justify-center p-8 gap-2 mt-16">
                    <p className="text-muted text-center">
                        No chats yet —{' '}
                        <Link to="/people" className="text-brand-500 hover:text-brand-400 font-bold transition-colors">
                            match with someone
                        </Link>{' '}
                        to start talking!
                    </p>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col divide-y divide-border">
                    {chats.map(chat => {
                        const otherUserDetails = chat.participantIds.find(u => u._id !== user?._id)
                        const otherUser = otherUserDetails?.basicInfo
                        const mainPhoto = otherUserDetails?.profile?.photos.find(p => p.isPrimary) ?? otherUserDetails?.profile?.photos?.[0]
                        const name = otherUser?.firstName
                            ? `${otherUser.firstName}${otherUser.lastName ? ' ' + otherUser.lastName : ''}`
                            : 'Unknown'
                        const isUnread = !chat.lastMessagePreview

                        return (
                            <div
                                key={chat._id}
                                onClick={() => navigate(`/chat/${chat._id}`)}
                                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-hover transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                    {mainPhoto ? (
                                        <img
                                            src={mainPhoto.url}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-lg">
                                            {name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Name + preview */}
                                <div className="flex-1 min-w-0 text-center">
                                    <p className="font-semibold text-foreground truncate">
                                        {name}
                                    </p>
                                    <p className={`text-sm truncate ${isUnread ? 'text-brand-400 font-medium' : 'text-muted'}`}>
                                        {chat.lastMessagePreview || 'Say hello!'}
                                    </p>
                                </div>

                                {/* Timestamp + unread dot */}
                                <div className="flex flex-col items-end gap-1 shrink-0 w-20">
                                    {chat.lastMessageAt && (
                                        <p className={`text-xs ${isUnread ? 'text-brand-500 font-semibold' : 'text-subtle'}`}>
                                            {new Date(chat.lastMessageAt).toLocaleDateString()}
                                        </p>
                                    )}
                                    {isUnread && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                                    )}
                                </div>

                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}