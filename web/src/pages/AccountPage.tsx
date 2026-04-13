import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { FullUser } from '../types'
import { GENDER_OPTIONS, ALL_GENDERS, MAJOR_LIST, CLASS_YEAR_OPTIONS, PROMPT_LIST } from "../constants/profileOptions"
import axios from "axios"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

type Section = 'basicInfo' | 'profile' | 'preferences' | null

export default function AccountPage() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const photoInput = useRef<HTMLInputElement>(null)

    const [user, setUser] = useState<FullUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [editing, setEditing] = useState<Section>(null)
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

    const [basicEdit, setBasicEdit] = useState({
        firstName: '', lastName: '', age: 18, gender: '', major: '', classYear: ''
    })
    const [profileEdit, setProfileEdit] = useState({
        bio: '',
        datingIntentions: '',
        prompts: [] as { question: string; answer: string }[]
    })
    const [prefsEdit, setPrefsEdit] = useState({
        ageMin: 18, ageMax: 99, interestedInGenders: [] as string[]
    })

    useEffect(() => {
        api.users.getMe()
            .then(data => {
                setUser(data)
                setBasicEdit({
                    firstName: data.basicInfo?.firstName ?? '',
                    lastName: data.basicInfo?.lastName ?? '',
                    age: data.basicInfo?.age ?? 18,
                    gender: data.basicInfo?.gender ?? '',
                    major: data.basicInfo?.major ?? '',
                    classYear: data.basicInfo?.classYear ?? ''
                })
                setProfileEdit({
                    bio: data.profile?.bio ?? '',
                    datingIntentions: data.profile?.datingIntentions ?? '',
                    prompts: data.profile?.promptAnswers?.map(p => ({
                        question: p.question,
                        answer: p.answer
                    })) ?? []
                })
                setPrefsEdit({
                    ageMin: data.preferences?.ageMin ?? 18,
                    ageMax: data.preferences?.ageMax ?? 99,
                    interestedInGenders: data.preferences?.interestedInGenders ?? []
                })
            })
            .catch(err => {
                const errorMsg = 'Failed to load profile'
                setError(axios.isAxiosError(err)
                    ? (err.response?.data?.message ?? errorMsg)
                    : errorMsg
                )
            })
            .finally(() => setLoading(false))
    }, [])

    async function saveBasicInfo() {
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.users.updateBasicInfo(basicEdit)
            setUser(prev => prev ? { ...prev, basicInfo: { ...prev.basicInfo, ...basicEdit } } : prev)
            setSuccess('Basic info saved')
            setEditing(null)
        } catch (err) {
            const errorMsg = 'Save failed'
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? errorMsg): errorMsg)
        } finally {
            setSaving(false)
        }
    }

    async function saveProfile() {
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const cleanedPrompts = profileEdit.prompts
                .map(prompt => ({
                    question: prompt.question.trim(),
                    answer: prompt.answer.trim()
                }))
                .filter(prompt => prompt.question && prompt.answer)

            const updatedProfilePayload = {
                bio: profileEdit.bio,
                datingIntentions: profileEdit.datingIntentions,
                photos: user?.profile?.photos?.map(p => ({ url: p.url, publicId: p.publicId })) ?? [],
                promptAnswers: cleanedPrompts,
                interestTagIds: user?.profile?.interestTagIds ?? []
            }

            await api.users.updateProfile(updatedProfilePayload)

            setUser(prev => prev ? {
                ...prev,
                profile: {
                    ...prev.profile,
                    bio: updatedProfilePayload.bio,
                    datingIntentions: updatedProfilePayload.datingIntentions,
                    promptAnswers: cleanedPrompts,
                    photos: prev.profile.photos
                }
            } : prev)

            setProfileEdit(prev => ({
                ...prev,
                prompts: cleanedPrompts
            }))

            setSuccess('Profile saved')
            setEditing(null)
        } catch (err) {
            const errorMsg = 'Save failed'
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? errorMsg) : errorMsg)
        } finally {
            setSaving(false)
        }
    }

    async function savePreferences() {
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.users.updatePreferences(prefsEdit)
            setUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...prefsEdit } } : prev)
            setSuccess('Preferences saved')
            setEditing(null)
        } catch (err) {
            const errorMsg = 'Save failed'
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? errorMsg) : errorMsg)
        } finally {
            setSaving(false)
        }
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('photo', file)
            await api.profile.uploadPhoto(formData)
            const updated = await api.users.getMe()
            setUser(updated)
            setSuccess('Photo uploaded')
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Upload failed') : 'Upload failed')
        } finally {
            setUploading(false)
            if (photoInput.current) photoInput.current.value = ''
        }
    }

    async function handleDeletePhoto(photoId: string) {
        setError(null)
        try {
            await api.profile.deletePhoto(photoId)
            setUser(prev => prev ? {
                ...prev,
                profile: {
                    ...prev.profile,
                    photos: prev.profile.photos.filter(p => p._id !== photoId)
                }
            } : prev)
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Delete failed') : 'Delete failed')
        }
    }

    async function handleSetPrimary(photoId: string) {
        setError(null)
        try {
            await api.profile.setPrimaryPhoto(photoId)
            setUser(prev => prev ? {
                ...prev,
                profile: {
                    ...prev.profile,
                    photos: prev.profile.photos.map(p => ({ ...p, isPrimary: p._id === photoId }))
                }
            } : prev)
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed') : 'Failed')
        }
    }

    function handleMovePhoto(photoId: string, direction: 'left' | 'right') {
        setUser(prev => {
            if (!prev) return prev

            const photos = [...prev.profile.photos]
            const index = photos.findIndex(p => p._id === photoId)
            if (index === -1) return prev

            const targetIndex = direction === 'left' ? index - 1 : index + 1

            if (targetIndex < 0 || targetIndex >= photos.length) return prev

            const [movedPhoto] = photos.splice(index, 1)

            photos.splice(targetIndex, 0, movedPhoto)

            return {
                ...prev,
                profile: {
                    ...prev.profile,
                    photos
                }
            }
        })
    }

    function handleLogout() {
        logout()
        navigate('/login')
    }

    if (loading) return <p className="p-4">Loading...</p>
    if (!user) return <p className="p-4 text-red-500">{error ?? 'Could not load profile'}</p>

    const photos = user.profile?.photos ?? []

    return (
        <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">

            <h1 className="text-xl font-bold text-white">Your Profile</h1>
            {error   && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <div className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-white">Photos</h2>
                    {photos.length < 6 && (
                        <button
                            onClick={() => photoInput.current?.click()}
                            disabled={uploading}
                            className="text-sm text-indigo-400 disabled:opacity-40"
                        >
                            {uploading ? 'Uploading...' : '+ Add photo'}
                        </button>
                    )}
                    <input
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                </div>

                {photos.length === 0 ? (
                    <p className="text-white/40 text-sm italic">No photos yet — add one to appear in the swipe queue</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo) => (
                            <div
                                key={photo._id}
                                onClick={() => setSelectedPhotoId(prev => prev === photo._id ? null : photo._id)}
                                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${selectedPhotoId === photo._id ? 'ring-2 ring-pink-500 scale-95' : ''}`}
                            >
                                <img
                                    src={photo.url}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                                {photo.isPrimary && (
                                    <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                        Main
                                    </div>
                                )}
                                {selectedPhotoId === photo._id && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                                            <span className="text-white text-xs"><Check /></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-white/30 text-xs mt-2">{photos.length}/6 photos</p>

                {selectedPhotoId && (() => {
                    const idx = photos.findIndex(p => p._id === selectedPhotoId)
                    const photo = photos[idx]
                    if (!photo) return null

                    return (
                        <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { handleMovePhoto(photo._id, 'left'); setSelectedPhotoId(null) }}
                                    disabled={idx === 0}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm disabled:opacity-30 flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft /> Move left
                                </button>
                                <button
                                    onClick={() => { handleMovePhoto(photo._id, 'right'); setSelectedPhotoId(null) }}
                                    disabled={idx === photos.length - 1}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm disabled:opacity-30 flex items-center justify-center gap-1"
                                >
                                    Move right <ArrowRight />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {!photo.isPrimary && (
                                    <button
                                        onClick={() => {handleSetPrimary(photo._id); setSelectedPhotoId(null) }}
                                        className="text-xs text-white bg-pink-500 px-2 py-1 rounded-full"
                                    >
                                        Set main
                                    </button>
                                )}
                                <button
                                    onClick={() => {handleDeletePhoto(photo._id); setSelectedPhotoId(null)} }
                                    className="text-xs text-white bg-red-500 px-2 py-1 rounded-full"
                                >
                                    Delete
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedPhotoId(null)}
                                className="text-white/40 text-xs text-center"
                            >
                                Cancel
                            </button>
                        </div>
                    )
                })()}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-white">Basic Info</h2>
                    {editing !== 'basicInfo'
                        ? <button className="text-sm text-indigo-400" onClick={() => setEditing('basicInfo')}>Edit</button>
                        : <div className="flex gap-2">
                            <button className="text-sm text-gray-400" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="text-sm text-indigo-400 font-semibold" onClick={saveBasicInfo} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    }
                </div>

                {editing === 'basicInfo' ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input className="flex-1 rounded-lg p-2 bg-white/20 text-white placeholder-white/50" placeholder="First name" value={basicEdit.firstName} onChange={e => setBasicEdit(p => ({ ...p, firstName: e.target.value }))} />
                            <input className="flex-1 rounded-lg p-2 bg-white/20 text-white placeholder-white/50" placeholder="Last name"  value={basicEdit.lastName}  onChange={e => setBasicEdit(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                        <input type="number" className="rounded-lg p-2 bg-white/20 text-white" placeholder="Age" min={18} max={99} value={basicEdit.age} onChange={e => setBasicEdit(p => ({ ...p, age: Number(e.target.value) }))} />
                        <select className="rounded-lg p-2 bg-white/20 text-white" value={basicEdit.gender} onChange={e => setBasicEdit(p => ({ ...p, gender: e.target.value }))}>
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.filter(g => g !== 'Unspecified').map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select className="rounded-lg p-2 bg-white/20 text-white" value={basicEdit.major} onChange={e => setBasicEdit(p => ({ ...p, major: e.target.value }))}>
                            <option value="">Select major</option>
                            {MAJOR_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="rounded-lg p-2 bg-white/20 text-white" value={basicEdit.classYear} onChange={e => setBasicEdit(p => ({ ...p, classYear: e.target.value }))}>
                            <option value="">Select class year</option>
                            {CLASS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="text-white/80 text-sm flex flex-col gap-1">
                        <p className="font-medium text-white">{user.basicInfo?.firstName} {user.basicInfo?.lastName}</p>
                        <p>Age: {user.basicInfo?.age ?? '—'}</p>
                        <p>Gender: {user.basicInfo?.gender ?? '—'}</p>
                        <p>Major: {user.basicInfo?.major ?? '—'}</p>
                        <p>Class year: {user.basicInfo?.classYear ?? '—'}</p>
                    </div>
                )}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-white">Profile</h2>
                    {editing !== 'profile'
                        ? <button className="text-sm text-indigo-400" onClick={() => setEditing('profile')}>Edit</button>
                        : <div className="flex gap-2">
                            <button className="text-sm text-gray-400" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="text-sm text-indigo-400 font-semibold" onClick={saveProfile} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    }
                </div>

                {editing === 'profile' ? (
                    <div className="flex flex-col gap-3">
                        <textarea
                            className="rounded-lg p-2 bg-white/20 text-white placeholder-white/50 resize-none"
                            placeholder="Bio (max 500 chars)"
                            maxLength={500}
                            rows={3}
                            value={profileEdit.bio}
                            onChange={e => setProfileEdit(p => ({ ...p, bio: e.target.value }))}
                        />
                        <select
                            className="rounded-lg p-2 bg-white/20 text-white"
                            value={profileEdit.datingIntentions}
                            onChange={e => setProfileEdit(p => ({ ...p, datingIntentions: e.target.value }))}
                        >
                            <option value="" disabled>Dating intention</option>
                            <option>Long-term relationship</option>
                            <option>Short-term relationship</option>
                            <option>Figuring it out</option>
                            <option>Prefer not to say</option>
                        </select>
                        <div className="flex flex-col gap-2">
                            <p className="text-white/60 text-xs">Prompts (up to 3)</p>
                            {profileEdit.prompts.map((prompt, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <select className="rounded-lg p-2 bg-white/20 text-white text-sm" value={prompt.question} onChange={e => {
                                        const updated = [...profileEdit.prompts]
                                        updated[i] = { ...updated[i], question: e.target.value }
                                        setProfileEdit(p => ({ ...p, prompts: updated }))
                                    }}>
                                        {PROMPT_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <input className="flex-1 rounded-lg p-2 bg-white/20 text-white text-sm placeholder-white/50" placeholder="Your answer..." value={prompt.answer} onChange={e => {
                                            const updated = [...profileEdit.prompts]
                                            updated[i] = { ...updated[i], answer: e.target.value }
                                            setProfileEdit(p => ({ ...p, prompts: updated }))
                                        }} />
                                        <button className="text-red-400 text-sm px-2" onClick={() => setProfileEdit(p => ({ ...p, prompts: p.prompts.filter((_, j) => j !== i) }))}>✕</button>
                                    </div>
                                </div>
                            ))}
                            {profileEdit.prompts.length < 3 && (
                                <button className="text-indigo-400 text-sm self-start" onClick={() => setProfileEdit(p => ({ ...p, prompts: [...p.prompts, { question: PROMPT_LIST[0], answer: '' }] }))}>
                                    + Add prompt
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-white/80 text-sm flex flex-col gap-2">
                        <p>{user.profile?.bio || <span className="text-white/40 italic">No bio yet</span>}</p>
                        {(user.profile)?.datingIntentions && (
                            <p className="text-white/50">Looking for: {(user.profile).datingIntentions}</p>
                        )}
                        {user.profile?.promptAnswers?.map((p, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2">
                                <p className="text-white/50 text-xs">{p.question}</p>
                                <p>{p.answer}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-white">Preferences</h2>
                    {editing !== 'preferences'
                        ? <button className="text-sm text-indigo-400" onClick={() => setEditing('preferences')}>Edit</button>
                        : <div className="flex gap-2">
                            <button className="text-sm text-gray-400" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="text-sm text-indigo-400 font-semibold" onClick={savePreferences} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    }
                </div>

                {editing === 'preferences' ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3 items-center">
                            <div className="flex gap-2 items-center flex-1">
                                <label className="text-white/60 text-sm">Min</label>
                                <input type="number" className="flex-1 rounded-lg p-2 bg-white/20 text-white" min={18} max={99} value={prefsEdit.ageMin} onChange={e => setPrefsEdit(p => ({ ...p, ageMin: Number(e.target.value) }))} />
                            </div>
                            <div className="flex gap-2 items-center flex-1">
                                <label className="text-white/60 text-sm">Max</label>
                                <input type="number" className="flex-1 rounded-lg p-2 bg-white/20 text-white" min={18} max={99} value={prefsEdit.ageMax} onChange={e => setPrefsEdit(p => ({ ...p, ageMax: Number(e.target.value) }))} />
                            </div>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-2">Interested in</p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_GENDERS.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setPrefsEdit(p => ({
                                            ...p,
                                            interestedInGenders: p.interestedInGenders.includes(opt)
                                                ? p.interestedInGenders.filter(g => g !== opt)
                                                : [...p.interestedInGenders, opt]
                                        }))}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            prefsEdit.interestedInGenders.includes(opt)
                                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                                : 'border-white/30 text-white/60'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPrefsEdit(p => ({ ...p, interestedInGenders: [...ALL_GENDERS] }))}
                                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${ALL_GENDERS.every(g => prefsEdit.interestedInGenders.includes(g))
                                        ? 'bg-pink-500 border-pink-500 text-white'
                                        : 'border-white/30 text-white/60'
                                    }`}
                                >
                                    All
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-white/80 text-sm flex flex-col gap-1">
                        <p>Age range: {user.preferences?.ageMin ?? 18} – {user.preferences?.ageMax ?? 99}</p>
                        <p>Interested in: {user.preferences?.interestedInGenders?.join(', ') || '—'}</p>
                    </div>
                )}
            </div>

            <div className="bg-white/10 rounded-xl p-4 flex flex-col gap-2">
                <h2 className="font-semibold text-white mb-1">Account</h2>
                <p className="text-white/60 text-sm">{user.email}</p>
                <button
                    onClick={handleLogout}
                    className="mt-2 w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                    Log out
                </button>
            </div>

        </div>
    )
}