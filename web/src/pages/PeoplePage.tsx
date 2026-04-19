import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { PotentialMatch } from "../types"
import axios from "axios";
import { HeartHandshake, XCircle, ArrowRightCircle } from "lucide-react";
import ProfileView from "../components/ProfileView";

export default function PeoplePage() {
    const navigate = useNavigate()
    const [queue, setQueue] = useState<PotentialMatch[]>([])
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [matchedUser, setMatchedUser] = useState<PotentialMatch | null>(null)
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
    const [fadeIn, setFadeIn] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const [buttonsFaded, setButtonsFaded] = useState(false)

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
        setButtonsFaded(true)
        setSwipeDirection(type === 'like' ? 'right' : 'left')

        await new Promise(resolve => setTimeout(resolve, 500))
        setSwipeDirection(null)
        setIsHidden(true)

        try {
            const result = await api.interactions.interact(current._id, type)
            if (result.matched) {
                setMatchedUser(current)
                setTimeout(() => setQueue(prev => prev.slice(1)), 800)
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
            setIsHidden(false)
            setButtonsFaded(false)
            setFadeIn(true)
            setTimeout(() => setFadeIn(false), 400)
            setActing(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-muted">Loading...</p>
        </div>
    )

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-error">{error}</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center gap-6 p-4">

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

            {/* Match notification */}
            {matchedUser && (
                <div
                    onClick={() => navigate(`/chat/${matchedUser._id}`)}
                    className="fixed top-6 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-6 py-3 rounded-full shadow-xl z-50 text-lg font-bold animate-bounce cursor-pointer"
                >
                    It's a Match with {matchedUser.basicInfo.firstName}!
                </div>
            )}

            {!current ? (
                <div className="relative z-10 text-center flex flex-col items-center gap-3">
                    <p className="text-foreground">Check back later for more potential matches!</p>
                    <p className="text-muted">
                        In the meantime,{' '}
                        <Link className="text-brand-500 hover:text-brand-400 font-bold transition-colors underline" to="/chats">
                            chat with your matches!
                        </Link>
                    </p>
                </div>
            ) : (
                <>
                    <div className="relative z-10 flex items-center justify-center gap-0">

                        {/* Pass panel — left */}
                        <button
                            onClick={() => handleInteract('pass')}
                            disabled={acting}
                            className={`h-full min-h-[500px] w-20 flex items-center justify-center bg-neutral-900/40 hover:bg-neutral-900/60 backdrop-blur-sm border-r border-border rounded-l-2xl group transition-opacity duration-300 ${buttonsFaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <XCircle
                                size={36}
                                className="text-muted group-hover:text-neutral-200 group-hover:scale-110 transition-all"
                            />
                        </button>

                        {/* Profile card */}
                        <div className={`
                            ${swipeDirection === 'left' ? 'swipe-left' :
                              swipeDirection === 'right' ? 'swipe-right' : ''}
                            ${fadeIn ? 'fade-in' : ''}
                            ${isHidden ? 'invisible' : ''}
                        `}>
                            <ProfileView person={current} />
                        </div>

                        {/* Like panel — right */}
                        <button
                            onClick={() => handleInteract('like')}
                            disabled={acting}
                            className={`h-full min-h-[500px] w-20 flex items-center justify-center bg-brand-500/20 hover:bg-brand-500/40 backdrop-blur-sm border-l border-border rounded-r-2xl group transition-opacity duration-300 ${buttonsFaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <HeartHandshake
                                size={36}
                                className="text-brand-400 group-hover:text-brand-300 group-hover:scale-110 transition-all"
                            />
                        </button>
                    </div>

                    <p className="relative z-10 text-subtle text-sm">
                        {queue.length} {queue.length === 1 ? 'person' : 'people'} left
                    </p>
                </>
            )}

            {matchedUser && (
                <button
                    onClick={() => navigate('/chats')}
                    className="relative z-10 flex items-center gap-2 text-brand-500 hover:text-brand-400 font-semibold transition-colors"
                >
                    View your matches <ArrowRightCircle />
                </button>
            )}

        </div>
    )
}