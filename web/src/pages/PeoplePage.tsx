import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { PotentialMatch } from "../types"
import axios from "axios";
import { ArrowRightCircle, ChevronLeft, ChevronRight, HeartHandshake, PersonStanding, X, XCircle } from "lucide-react";

export default function PeoplePage() {
    const navigate = useNavigate()
    const [queue, setQueue] = useState<PotentialMatch[]>([])
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [photoIndex, setPhotoIndex] = useState(0)
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchedUser, setMatchedUser] = useState<PotentialMatch | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const users = await api.users.discover()
                setQueue(users)
                setPhotoIndex(0)
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

    useEffect(() => {
        setPhotoIndex(0)
        setGalleryOpen(false)
    }, [current?._id])

    const photos = current?.profile.photos ?? []
    const hasPhotos = photos.length > 0
    const currentPhoto = hasPhotos ? photos[photoIndex] : null

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setGalleryOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    function showPrevPhoto() {
        if (!hasPhotos) return
        setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    }

    function showNextPhoto() {
        if (!hasPhotos) return
        setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    }

    function openGallery() {
        if (!hasPhotos) return
        setGalleryOpen(true)
    }

    function closeGallery() {
        setGalleryOpen(false)
    }

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
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-gray-50">
            {matchedUser && (
                <div
                    onClick={() => navigate(`/chat/${matchedUser._id}`)}
                    className="fixed top-6 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-6 py-3 rounded-full shadow-xl z-50 text-lg font-bold animate-bounce"
                >
                    It's a Match with {matchedUser.basicInfo.firstName}!
                </div>
            )}

            {galleryOpen && currentPhoto && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={closeGallery}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeGallery}
                            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                        >
                            <X size={22} />
                        </button>

                        {photos.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrevPhoto}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <img
                                    src={currentPhoto.url}
                                    alt={`${current.basicInfo.firstName ?? "Profile"} photo ${photoIndex + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-2xl"
                                />

                                <button
                                    type="button"
                                    onClick={showNextPhoto}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                        {photos.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                                <p className="text-white/80 text-sm">
                                    {photoIndex + 1} / {photos.length}
                                </p>
                                <div className="flex gap-2">
                                    {photos.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all ${i === photoIndex ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!current ? (
                <div className="text-center">
                    <p className="text-xl font-semibold">No more people to show</p>
                    <p className="text-gray-500 mt-2">Check back later!</p>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative h-96 bg-gray-200">
                            {currentPhoto ? (
                                <button
                                    type="button"
                                    onClick={openGallery}
                                    className="w-full h-full block cursor-zoom-in"
                                >
                                    <img
                                        src={currentPhoto.url}
                                        alt={`${current.basicInfo.firstName ?? "Profile"}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ): (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <PersonStanding size={48} />
                                </div>
                            )}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPrevPhoto}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/50 transition"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={showNextPhoto}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/50 transition"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}

                            {photos.length > 1 && (
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    {photos.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all ${
                                                i === photoIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
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
                            <div className="p-4 border-t">
                                <p className="text-gray-700 text-sm leading-relaxed">{current.profile.bio}</p>
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

                    <div className="flex gap-10">
                        <button
                            onClick={() => handleInteract('pass')}
                            disabled={acting}
                            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 border border-gray-200"
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

                    {matchedUser && (
                        <button
                            onClick={() => navigate('/messages')}
                            className="flex items-center gap-2 text-pink-500 font-semibold hover:underline"
                        >
                            View your matches <ArrowRightCircle /> 
                        </button>
                    )}
                </>
            )}
        </div>
    )
}