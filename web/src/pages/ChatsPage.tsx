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

    if (loading) return <p className="p-4">Loading chats...</p>
    if (error) return <p className="p-4 text-red-500">{error}</p>

    return (
        <div>
            <h1 className='text-white p-4 text-xl font-bold'>Messages</h1>

            {chats.length === 0 ? (
                <p className="p-4 text-gray-400">
                    No chats yet -{' '}
                    <Link to="/people" className="text-pink-500 underline">
                        match with someone
                    </Link>{' '}
                    to start taking!
                </p>
            ) : (
                <div className="flex flex-col divide-y divide-white/10">
                    {chats.map(chat => {
                        const otherUserDetails = chat.participantIds.find(u => u._id !== user?._id)
                        const otherUser = otherUserDetails?.basicInfo
                        const mainPhoto = otherUserDetails?.profile?.photos.find(p => p.isPrimary) ?? otherUserDetails?.profile?.photos?.[0]
                        const name = otherUser?.firstName ? `${otherUser.firstName}${otherUser.lastName ? ' ' + otherUser.lastName : ''}`
                        : 'Unknown'

                        return (
                            <div
                                key={chat._id}
                                onClick={() => navigate(`/chat/${chat._id}`)}
                                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                    {mainPhoto ? (
                                        <img
                                            src={mainPhoto.url} alt={name} className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-pink-400/30 flex items-center justify-center text-white font-bold text-lg">
                                            {name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">
                                        {name}
                                    </p>
                                    <p className={`text-sm truncate ${chat.lastMessagePreview ? "text-gray-400" : "text-pink-400"}`}>
                                        {chat.lastMessagePreview || 'Say hello!'}
                                    </p>
                                </div>

                                {chat.lastMessageAt && (
                                    <p className="text-xs text-gray-500 shrink-0">
                                        {new Date(chat.lastMessageAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}