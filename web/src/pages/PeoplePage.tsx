import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { PotentialMatch } from "../types"
import axios from "axios";
import { ArrowRightCircle, HeartHandshake, XCircle } from "lucide-react";
import ProfileView from "../components/ProfileView";

export default function PeoplePage() {
    const navigate = useNavigate()
    const [queue, setQueue] = useState<PotentialMatch[]>([])
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchedUser, setMatchedUser] = useState<PotentialMatch | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const users = await api.users.discover()
                setQueue(users)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message ?? 'Failed to load people')
                } else {
                    setError('Failed to load people')
                }
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const current = queue[0] ?? null

    async function handleInteract(type: 'like' | 'pass') {
        if (!current || acting) return
        setActing(true)
        setMatchedUser(null)
        try {
            const result = await api.interactions.interact(current._id, type)
            if (result.matched) {
                setMatchedUser(current)
                setTimeout(() => {
                    setQueue(prev => prev.slice(1))
                }, 800)
            } else {
                setQueue(prev => prev.slice(1))
            }
        } catch (err) {
            const errorMsg = 'Action failed'
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? errorMsg)
            } else {
                setError(errorMsg)
            }
        } finally {
            setActing(false)
        }
    }

    if (loading) return <p className="text-center mt-10">Loading...</p>
    if (error) return <p className="text-center mt-10 text-error">{error}</p>

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-background">
            {matchedUser && (
                <div
                    onClick={() => navigate(`/chat/${matchedUser._id}`)}
                    className="fixed top-6 left-1/2 -translate-x-1/2 bg-brand-450 text-foreground px-6 py-3 rounded-full shadow-xl z-50 text-lg font-bold animate-bounce"
                >
                    It's a Match with {matchedUser.basicInfo.firstName}!
                </div>
            )}

            {!current ? (
                <div className="text-center flex flex-col items-center gap-3">
                    <p className="text-foreground">Check back later for more potential matches!</p>
                    <p>In the meantime, <Link className="text-brand-450 underline" to={'/messages'}>Chat with your matches!</Link></p>
                </div>
            ) : (
                <>
                    <ProfileView person={current} />

                    <div className="flex gap-10">
                        <button
                            onClick={() => handleInteract('pass')}
                            disabled={acting}
                            className="w-16 h-16 rounded-full bg-background shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 border border-gray-200"
                        >
                            <XCircle className="text-gray-500" size={32} />
                        </button>
                        <button
                            onClick={() => handleInteract('like')}
                            disabled={acting}
                            className="w-16 h-16 rounded-full bg-pink-500 shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <HeartHandshake className="text-white" size={32} />
                        </button>
                    </div>

                    <p className="text-gray-400 text-sm">{queue.length} {queue.length === 1 ? 'person' : 'people'} left</p>
                </>
            )}

            {matchedUser && (
                <button
                    onClick={() => navigate('/chats')}
                    className="flex items-center gap-2 text-pink-500 font-semibold hover:underline"
                >
                    View your matches <ArrowRightCircle /> 
                </button>
            )}
        </div>
    )
}