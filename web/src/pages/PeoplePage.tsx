import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { PotentialMatch } from "../types"
import axios from "axios";
import { ArrowRightCircle, HeartHandshake, PersonStanding, XCircle } from "lucide-react";

export default function PeoplePage() {
    const navigate = useNavigate()
    const [queue, setQueue] = useState<PotentialMatch[]>([])
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matched, setMatched] = useState(false);

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
        setMatched(false)
        try {
            const result = await api.interactions.interact(current._id, type)
            if (result.matched) setMatched(true)
            setQueue(prev => prev.slice(1))
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
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
            {matched && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-bold animate-bounce">
                    It's a Match!
                </div>
            )}

            {!current ? (
                <div className="text-center">
                    <p className="text-xl font-semibold">No more people to show</p>
                    <p className="text-gray-500 mt-2">Check back later!</p>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="relative h-96 bg-gray-200">
                            {current.profile.photos.length > 0 ? (
                                <img
                                    src={current.profile.photos[0].url}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ): (
                                <div>
                                    <PersonStanding />
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 fight-0 bg-linear-to-t from-black/70 to-transparent">
                                <h2 className="text-white text-2xl font-bold">
                                    {current.basicInfo.firstName ?? 'Unknown'}
                                    {current.basicInfo.age ? `, ${current.basicInfo.age}` : ''}
                                </h2>
                                {current.basicInfo.major && (
                                    <p className="text-white/80 text-sm">{current.basicInfo.major}</p>
                                )}
                            </div>
                        </div>

                        {current.profile.bio && (
                            <div>
                                <p className="text-gray-700 text-sm">{current.profile.bio}</p>
                            </div>
                        )}

                        {current.profile.promptAnswers.length > 0 && (
                            <div className="p-4 flex flex-col gap-3">
                                {current.profile.promptAnswers.slice(0, 2).map((p, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-1">{p.question}</p>
                                        <p className="text-sm text-gray-700">{p.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-400 text-sm">{queue.length} people left</p>

                    <div className="flex gap-8">
                        <button
                            onClick={() => handleInteract('pass')}
                            disabled={acting}
                            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <XCircle />
                        </button>
                        <button
                            onClick={() => handleInteract('like')}
                            disabled={acting}
                            className="w-16 h-16 rounded-full bg-pink-500 shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <HeartHandshake color="pink" />
                        </button>
                    </div>

                    {matched && (
                        <button
                            onClick={() => navigate('/messages')}
                            className="text-pink-500 underline text-sm"
                        >
                            View your matches <ArrowRightCircle /> 
                        </button>
                    )}
                </>
            )}
        </div>
    )
}