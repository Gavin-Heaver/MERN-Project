import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { Message, Conversation } from "../types"
import axios from "axios"
import { ArrowLeft, ArrowUp, Menu } from "lucide-react"

export default function MessagePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { chatId } = useParams<{ chatId: string }>()

    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending]             = useState(false)
    const [error, setError]                 = useState<string | null>(null)
    const [menuOpen, setMenuOpen]           = useState(false)
    const [showConfirm, setShowConfirm]     = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)

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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const otherUserDetails = conversation?.participantIds.find(u => u._id !== user!.id)
    const otherUser = otherUserDetails?.basicInfo
    const matchName = otherUser?.firstName
        ? `${otherUser.firstName}${otherUser.lastName ? ' ' + otherUser.lastName : ''}`
        : loading ? 'Loading...' : 'Unknown'
    
    const toUserId = otherUserDetails?._id

    async function handleSend(e: React.SyntheticEvent) {
        e.preventDefault()
        if (!newMessage.trim() || !toUserId || sending) return
        setSending(true)
        try {
            const sent = await api.messages.send(toUserId, newMessage.trim())
            if (sent) setMessages(prev => [...prev, sent])
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
        <div className="flex flex-col flex-1 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/messages')}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-pink-400/30 flex items-center justify-center text-white font-bold shrink-0">
                        {matchName[0]?.toUpperCase() ?? '?'}
                    </div>
                    <p className="text-white font-semibold">{matchName}</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(p => !p)}
                        className="text-white/60 hover:text-white px-2 py-1 text-xl transition-colors"
                    >
                        <Menu />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl z-10 overflow-hidden min-w-32">
                            <button
                                onClick={() => { setShowConfirm(true); setMenuOpen(false) }}
                                className="block w-full text-left px-4 py-2 text-red-500 text-sm hover:bg-red-50 transition-colors"
                            >
                                Unmatch
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-2">Unmatch with {matchName}?</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            This will delete your conversation and you won't be able to message each other again.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnmatch}
                                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium"
                            >
                                Unmatch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-400 text-sm text-center py-2">{error}</p>
            )}

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {loading ? (
                    <p className="text-white/50 text-center mt-8">Loading...</p>
                ) : messages.length === 0 ? (
                    <p className="text-white/50 text-center mt-8">No messages yet — say hello! 👋</p>
                ) : (
                    messages.map(message => {
                        const mine = message.senderId === user?.id
                        return (
                            <div
                                key={message._id}
                                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                    mine
                                        ? 'bg-pink-500 text-white rounded-br-sm'
                                        : 'bg-white/15 text-white rounded-bl-sm'
                                }`}>
                                    <p className="text-sm">{message.text}</p>
                                    <p className={`text-xs mt-1 ${mine ? 'text-white/60' : 'text-white/40'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={handleSend}
                className="flex items-center gap-2 px-4 py-3 border-t border-white/10"
            >
                <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-400"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                >
                    <ArrowUp />
                </button>
            </form>

        </div>
    )
}
