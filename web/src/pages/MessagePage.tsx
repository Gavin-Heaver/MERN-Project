import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { Message, Conversation } from "../types"
import axios from "axios"
import { ArrowLeft, ArrowUp } from "lucide-react"
import ProfileView from "../components/ProfileView"
import { io, type Socket } from "socket.io-client"

export default function MessagePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { chatId } = useParams<{ chatId: string }>()

    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showProfile, setShowProfile] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!chatId) return
        api.messages.getMessages(chatId)
            .then(({ conversation: conv, messages: msgs }) => {
                setConversation(conv)
                setMessages(msgs)
            })
            .catch(err => setError(
                axios.isAxiosError(err)
                    ? (err.response?.data?.message ?? 'Failed to load messages')
                    : 'Failed to load messages'
            ))
            .finally(() => setLoading(false))
    }, [chatId])

    useEffect(() => {
        if (!chatId || !user?._id) return

        const socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:5001', {
            withCredentials: true,
            transports: ['websocket']
        })

        socketRef.current = socket

        socket.emit('messages:join', {
            conversationId: chatId,
            userId: user._id
        })

        socket.on('messages:join', (incomingMessage: Message) => {
            setMessages(prev => {
                if (prev.some(message => message._id)) return prev
                return [...prev, incomingMessage]
            })
        })

        return () => {
            socket.emit('message:leave', {
                conversationId: chatId,
                userId: user._id
            })
            socket.disconnect()
            socketRef.current = null
        }
    }, [chatId, user?._id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const otherUserDetails = conversation?.participantIds.find(u => u._id !== user!._id)
    const otherUser = otherUserDetails?.basicInfo
    const matchName = otherUser?.firstName
        ? `${otherUser.firstName}${otherUser.lastName ? ' ' + otherUser.lastName : ''}`
        : loading ? 'Loading...' : 'Unknown'
    const mainPhoto = otherUserDetails?.profile?.photos?.find(p => p.isPrimary) ?? otherUserDetails?.profile?.photos?.[0]
    const toUserId = otherUserDetails?._id

    async function handleSend(e: React.SyntheticEvent) {
        e.preventDefault()
        if (!newMessage.trim() || !toUserId || sending) return
        setSending(true)
        try {
            const sent = await api.messages.send(toUserId, newMessage.trim())
            if (sent) {
                setMessages(prev => {
                    if (prev.some(message => message._id === sent._id)) return prev
                    return [...prev, sent]
                })
                socketRef.current?.emit('messages:send', {
                    conversationId: chatId,
                    messages: sent
                })
            }
            setNewMessage('')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to send')
                : 'Failed to send'
            )
        } finally {
            setSending(false)
        }
    }

    async function handleUnmatch() {
        if (!chatId) return
        try {
            await api.matches.unmatch(chatId)
            navigate('/messages')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to unmatch')
                : 'Failed to unmatch'
            )
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Background triangles */}
            <svg
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/30" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/30" />
            </svg>

            {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border bg-background">                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/messages')}
                        className="text-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft />
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="w-9 h-9 rounded-full overflow-hidden shrink-0 focus:outline-none"
                    >
                        {mainPhoto ? (
                            <img
                                src={mainPhoto.url}
                                alt={matchName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                                {matchName[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="text-foreground font-semibold hover:text-muted transition-colors"
                    >
                        {matchName}
                    </button>
                </div>
            </div>

            {/* Profile modal */}
            {showProfile && otherUserDetails && (
                <div
                    onClick={() => { setShowProfile(false); setShowConfirm(false) }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-3xl"
                    >
                        <ProfileView person={otherUserDetails} />

                        {!showConfirm ? (
                            <div className="flex flex-col gap-2 p-3 bg-surface rounded-b-3xl">
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors"
                                >
                                    Unmatch
                                </button>
                                <button
                                    onClick={() => setShowProfile(false)}
                                    className="w-full py-2 text-muted text-sm hover:text-foreground transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 p-4 bg-surface rounded-b-3xl">
                                <p className="text-foreground text-sm text-center">
                                    Unmatch with {matchName}? This can't be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1 py-2 rounded-xl border border-border text-muted text-sm hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUnmatch}
                                        className="flex-1 py-2 rounded-xl bg-error text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Unmatch
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="relative z-10 text-error text-sm text-center py-2 bg-error/10 border-b border-error/20">
                    {error}
                </p>
            )}

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {loading ? (
                    <p className="text-muted text-center mt-8">Loading...</p>
                ) : messages.length === 0 ? (
                    <p className="text-muted text-center mt-8">No messages yet — say hello! 👋</p>
                ) : (
                    messages.map(message => {
                        const mine = message.senderId === user?._id
                        return (
                            <div
                                key={message._id}
                                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                    mine
                                        ? 'bg-brand-500 text-white rounded-br-sm'
                                        : 'bg-surface text-foreground rounded-bl-sm'
                                }`}>
                                    <p className="text-sm">{message.text}</p>
                                    <p className={`text-xs mt-1 ${mine ? 'text-white/60' : 'text-muted'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="relative z-10 flex items-center gap-2 px-4 py-3 border-t border-border"
            >
                <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 bg-surface text-foreground placeholder-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 border border-border transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white disabled:opacity-40 transition-all"
                >
                    <ArrowUp />
                </button>
            </form>

        </div>
    )
}