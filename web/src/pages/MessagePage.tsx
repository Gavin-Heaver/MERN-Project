import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { api } from "../api"

interface Message {
    id: string
    senderId: string
    content: string
    timestamp: string
}

interface MatchProfile {
    id: string
    name: string
    // WIP: expand this once the profile schema is finalized
}

export default function MessagePage() {
    const navigate = useNavigate()
    const { chatId } = useParams()

    const [messages, setMessages] = useState<Message[]>([])
    const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<null | string>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)

    // Fetch messages and match profile on load
    useEffect(() => {
        async function fetchData() {
            setError(null)
            try {
                const [messagesData, profileData] = await Promise.all([
                    api.messages.getMessages(chatId),
                    api.matches.getMatchProfile(chatId)  
                    // WIP: adjust to actual method
                ])
                setMessages(messagesData)
                setMatchProfile(profileData)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message ?? 'Failed to load messages')
                } else {
                    setError('Failed to load messages')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [chatId])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend(e: React.SyntheticEvent) {
        e.preventDefault()
        if (!newMessage.trim()) return
        try {
            await api.messages.sendMessage(chatId, { content: newMessage })
            setMessages(prev => [...prev, {
                id: Date.now().toString(),  // temp id until backend confirms
                senderId: 'me',
                content: newMessage,
                timestamp: new Date().toISOString()
            }])
            setNewMessage("")
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'Failed to send message')
            } else {
                setError('Failed to send message')
            }
        }
    }

    async function handleUnmatch() {
        try {
            await api.matches.unmatch(chatId)  
            // WIP: adjust to actual method
            navigate('/messages')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'Failed to unmatch')
            } else {
                setError('Failed to unmatch')
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <h1 className='text-white'>{matchProfile?.name ?? 'Loading...'}</h1>

                {/* 3 Dots Menu */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setMenuOpen(prev => !prev)}>⋮</button>

                    {menuOpen && (
                        <div style={{ position: 'absolute', right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 10 }}>
                            <button
                                onClick={() => { setShowUnmatchConfirm(true); setMenuOpen(false) }}
                                style={{ display: 'block', padding: '0.5rem 1rem', color: 'red' }}
                            >
                                Unmatch
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Unmatch Confirmation Popup */}
            {showUnmatchConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
                        <p>Are you sure you want to unmatch with {matchProfile?.name}?</p>
                        <button onClick={handleUnmatch} style={{ color: 'red', marginRight: '1rem' }}>Yes, unmatch</button>
                        <button onClick={() => setShowUnmatchConfirm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {error && <p style={{ color: 'red', padding: '0 1rem' }}>{error}</p>}

            {/* Profile Viewer - WIP */}
            <div style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
                <button onClick={() => setShowProfile(prev => !prev)}>
                    {showProfile ? 'Hide Profile' : `View ${matchProfile?.name ?? ''}'s Profile`}
                </button>

                {showProfile && (
                    <div>
                        {/* WIP: render full profile here once schema is finalized, mirroring the People page display */}
                        <p>Profile view coming soon!</p>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loading ? (
                    <p>Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p>No messages yet! Say hello 👋</p>
                ) : (
                    messages.map(message => (
                        <div
                            key={message.id}
                            style={{
                                alignSelf: message.senderId === 'me' ? 'flex-end' : 'flex-start',
                                background: message.senderId === 'me' ? '#007bff' : '#e0e0e0',
                                color: message.senderId === 'me' ? 'white' : 'black',
                                padding: '0.5rem 1rem',
                                borderRadius: '16px',
                                maxWidth: '70%'
                            }}
                        >
                            <p>{message.content}</p>
                            <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{message.timestamp}</p>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '1rem', gap: '0.5rem', borderTop: '1px solid #ccc' }}>
                <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit">Send</button>
            </form>

        </div>
    )
}