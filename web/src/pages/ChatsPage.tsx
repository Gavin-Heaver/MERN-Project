import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { api } from "../api"

interface Conversation 
{
    id: string
    participantName: string
    lastMessage: string
    lastMessageTime: string
}

export default function ChatsPage() {
    const navigate = useNavigate()

    const [chats, setChats] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<null | string>(null)

    useEffect(() => {
        async function fetchConversations() {
            setError(null)
            // try {
            //     //PLACEHOLDER API PATH!!!
            //     const data = await api.messages.getChats()
            //     setChats(data)
            // } catch (err) {
            //     if (axios.isAxiosError(err)) {
            //         setError(err.response?.data?.message ?? 'Failed to load chats')
            //     } else {
            //         setError('Failed to load chats')
            //     }
            // } finally {
            //     setLoading(false)
            // }
        }

        fetchConversations()
    }, [])

    return (
        <div>
            <h1 className='text-white p-4'>My Chats</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading ? (
                <p>Loading chats...</p>
            ) : chats.length === 0 ? (
                <p>No chats yet!</p>
            ) : (
                chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => navigate('/messages/${chat.id}')}
                        style={{ cursor: 'pointer' }}
                    >
                        <p>{chat.participantName}</p>
                        <p>{chat.lastMessage}</p>
                        <p>{chat.lastMessageTime}</p>
                    </div>
                ))
            )}
        </div>
    )
}