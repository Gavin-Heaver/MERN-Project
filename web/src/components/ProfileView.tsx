import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, PersonStanding, X } from "lucide-react"
import type { ProfileViewData } from "../types"

interface ProfileViewProps {
    person: ProfileViewData
}

export default function ProfileView({ person }: ProfileViewProps) {
    const photos = person.profile?.photos ?? []
    const hasPhotos = photos.length > 0
    const [photoIndex, setPhotoIndex] = useState(0)
    const [galleryOpen, setGalleryOpen] = useState(false)

    useEffect(() => {
        if (!galleryOpen) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setGalleryOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [galleryOpen])

    const currentPhoto = hasPhotos ? photos[photoIndex] : null

    function prevPhoto() { setPhotoIndex(i => (i === 0 ? photos.length - 1 : i - 1)) }
    function nextPhoto() { setPhotoIndex(i => (i === photos.length - 1 ? 0 : i + 1)) }

    return (
        <>
            {/* Fullscreen gallery */}
            {galleryOpen && currentPhoto && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setGalleryOpen(false)}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setGalleryOpen(false)}
                            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                        >
                            <X size={22} />
                        </button>

                        {photos.length > 1 && (
                            <button
                                onClick={prevPhoto}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <img
                            src={currentPhoto.url}
                            alt="profile"
                            className="max-w-full max-h-full object-contain rounded-2xl"
                        />

                        {photos.length > 1 && (
                            <button
                                onClick={nextPhoto}
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

            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

                <div className="relative h-96 bg-gray-200">
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
                                        i === photoIndex ? "w-6 bg-white" : "w-2 bg-white/50"
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

                {person.profile.bio && (
                    <div className="px-4 pt-4 border-t">
                        <p className="text-gray-700 text-sm leading-relaxed">{person.profile.bio}</p>
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
                            <div key={i} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-1">{p.question}</p>
                                <p className="text-sm text-gray-700">{p.answer}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}