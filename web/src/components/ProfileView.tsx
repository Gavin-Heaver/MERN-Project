import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, PersonStanding, X } from "lucide-react"
import type { ProfileViewData } from "../types"
import { api } from "../api"
import { useNavigate } from "react-router-dom"
import axios from "axios"

interface ProfileViewProps {
    person: ProfileViewData
    showUnmatch?: boolean
    close?: (() => void) | null
}

export default function ProfileView({ person, showUnmatch = false, close = null }: ProfileViewProps) {
    const navigate = useNavigate()

    const photos = person.profile?.photos ?? []
    const hasPhotos = photos.length > 0
    const [photoIndex, setPhotoIndex] = useState(0)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const currentPhoto = hasPhotos ? photos[photoIndex] : null

    function prevPhoto() { setPhotoIndex(i => (i === 0 ? photos.length - 1 : i - 1)) }
    function nextPhoto() { setPhotoIndex(i => (i === photos.length - 1 ? 0 : i + 1)) }

    useEffect(() => {
        if (!galleryOpen) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setGalleryOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [galleryOpen])

    useEffect(() => {
        function onArrowKey(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") prevPhoto()
            if (e.key === "ArrowRight") nextPhoto()
        }

        window.addEventListener("keydown", onArrowKey)
        return () => window.removeEventListener("keydown", onArrowKey)
    })

    async function handleUnmatch() {
        if (!person._id) return
        try {
            await api.interactions.unmatch(person._id)
            navigate('/chats')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to unmatch')
                : 'Failed to unmatch'
            )
        }
    }

    return (
        <>
            {/* Fullscreen gallery */}
            {galleryOpen && currentPhoto && (
                <div
                    className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4"
                    onClick={() => setGalleryOpen(false)}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                setGalleryOpen(false)
                            }}
                            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                        >
                            <X size={22} />
                        </button>

                        {photos.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    prevPhoto()
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <img
                            src={currentPhoto.url}
                            alt="profile"
                            className="max-w-full max-h-full object-contain rounded-2xl"
                            onClick={e => e.stopPropagation()}
                        />

                        {photos.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    nextPhoto()
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                            >
                                <ChevronRight size={24} />
                            </button>
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

            <div className="w-full max-w-sm bg-neutral-800 text-foreground rounded-3xl shadow-2xl overflow-hidden">

                <div className="relative h-96 bg-neutral-800">
                    {currentPhoto ? (
                        <button
                            type="button"
                            onClick={() => setGalleryOpen(true)}
                            className="w-full h-full block cursor-zoom-in"
                        >
                            <img
                                src={currentPhoto.url}
                                alt={person.basicInfo.firstName ?? 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <PersonStanding size={48} />
                        </div>
                    )}

                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/50 transition"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                type="button"
                                onClick={nextPhoto}
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
                                        i === photoIndex ? "w-6 bg-foreground" : "w-2 bg-white/50"
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h2 className="text-white text-2xl font-bold">
                            {person.basicInfo.firstName ?? 'Unknown'}
                            {person.basicInfo.age ? `, ${person.basicInfo.age}` : ''}
                        </h2>
                        {person.basicInfo.major && (
                            <p className="text-white/80 text-sm">{person.basicInfo.major}</p>
                        )}
                    </div>
                </div>

                <div className="pb-2">
                    {person.profile.bio && (
                        <div className="px-4 pt-4 border-t">
                            <p className="text-foreground text-sm leading-relaxed">{person.profile.bio}</p>
                        </div>
                    )}

                    {person.profile.datingIntentions && (
                        <div className="px-4 pt-2">
                            <p className="text-gray-400 text-xs">Looking for: {person.profile.datingIntentions}</p>
                        </div>
                    )}

                    {person.profile.promptAnswers.length > 0 && (
                        <div className="p-4 flex flex-col gap-3">
                            {person.profile.promptAnswers.slice(0, 3).map((p, i) => (
                                <div key={i} className="bg-background rounded-xl p-3">
                                    <p className="text-xs text-neutral-200 mb-1">{p.question}</p>
                                    <p className="text-sm text-brand-400">{p.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showUnmatch &&
                    <>
                        <div className="h-1 bg-brand-200 mx-4 rounded-full" />

                        {!showConfirm ? (
                            <div className="flex flex-col gap-2 p-3 bg-surface rounded-b-3xl">
                                {error && <div className="text-error">
                                    {error}
                                </div>}
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full py-2 rounded-xl bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors"
                                >
                                    Unmatch
                                </button>
                                <button
                                    onClick={() => close && close()}
                                    className="w-full py-2 text-muted text-sm hover:text-foreground transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 p-4 bg-surface rounded-b-3xl">
                                <p className="text-foreground text-sm text-center">
                                    Unmatch with {person.basicInfo.firstName}? This can't be undone.
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
                    </>
                }
            </div>
        </>
    )
}