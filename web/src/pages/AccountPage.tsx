import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { FullUser, ProfileViewData } from '../types'
import { GENDER_OPTIONS, ALL_GENDERS, MAJOR_LIST, CLASS_YEAR_OPTIONS, PROMPT_LIST } from "../constants/profileOptions"
import axios from "axios"
import { ArrowLeft, ArrowRight, Check, Eye, X } from "lucide-react"
import ProfileView from "../components/ProfileView"

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
    const [previewOpen, setPreviewOpen] = useState(false)
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

    const [basicEdit, setBasicEdit] = useState({
        firstName: '', lastName: '', age: null as number | null, gender: '', major: '', classYear: ''
    })
    const [profileEdit, setProfileEdit] = useState({
        bio: '',
        datingIntentions: '',
        prompts: [] as { question: string; answer: string }[]
    })
    const [prefsEdit, setPrefsEdit] = useState({
        ageMin: null as number | null, ageMax: null as number | null, interestedInGenders: [] as string[]
    })
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
        if (!basicEdit.age || basicEdit.age < 18 || basicEdit.age > 99) {
            setFieldErrors(p => ({ ...p, age: 'Age must be between 18 and 99' }))
            return
        }
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.users.updateBasicInfo({ ...basicEdit, age: basicEdit.age })
            setUser(prev => prev ? {
                ...prev,
                basicInfo: { ...prev.basicInfo, ...basicEdit, age: basicEdit.age as number }
            } : prev)
            setSuccess('Basic info saved')
            setEditing(null)
        } catch (err) {
            const errorMsg = 'Save failed'
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? errorMsg) : errorMsg)
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
                .map(prompt => ({ question: prompt.question.trim(), answer: prompt.answer.trim() }))
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
            setProfileEdit(prev => ({ ...prev, prompts: cleanedPrompts }))
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
        if (!prefsEdit.ageMin || prefsEdit.ageMin < 18 || prefsEdit.ageMin > 99) {
            setFieldErrors(p => ({ ...p, ageMin: 'Must be between 18 and 99' }))
            return
        }
        if (!prefsEdit.ageMax || prefsEdit.ageMax > 99 || prefsEdit.ageMax < prefsEdit.ageMin) {
            setFieldErrors(p => ({
                ...p,
                ageMax: prefsEdit.ageMax! < prefsEdit.ageMin! ? 'Max must be greater than min' : 'Must be 99 or under'
            }))
            return
        }
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.users.updatePreferences({ ...prefsEdit, ageMin: prefsEdit.ageMin, ageMax: prefsEdit.ageMax })
            setUser(prev => prev ? {
                ...prev,
                preferences: { ...prev.preferences, ...prefsEdit, ageMin: prefsEdit.ageMin as number, ageMax: prefsEdit.ageMax as number }
            } : prev)
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
        if (photos.length <= 1) {
            setError('You must have at least one photo')
            return
        }
        try {
            await api.profile.deletePhoto(photoId)
            setUser(prev => prev ? {
                ...prev,
                profile: { ...prev.profile, photos: prev.profile.photos.filter(p => p._id !== photoId) }
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
                profile: { ...prev.profile, photos: prev.profile.photos.map(p => ({ ...p, isPrimary: p._id === photoId })) }
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
            return { ...prev, profile: { ...prev.profile, photos } }
        })
    }

    const profileViewData: ProfileViewData | null = user ? {
        _id: user._id,
        basicInfo: user.basicInfo,
        profile: user.profile
    } : null

    function handleLogout() {
        logout()
        navigate('/login')
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-muted">Loading...</p>
        </div>
    )
    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-error">{error ?? 'Could not load profile'}</p>
        </div>
    )

    const photos = user.profile?.photos ?? []

    // shared input classes
    const inputCls = "w-full rounded-lg px-3 py-2 bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
    const selectCls = "w-full rounded-full px-4 py-3 bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm [&>option]:text-black [&>option]:bg-white"

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">

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

            <div className="relative z-10 max-w-lg mx-auto p-4 flex flex-col gap-4 pb-24">

                {/* Header */}
                <h1 className="text-3xl font-bold text-foreground pt-2">Your Profile</h1>

                {error && (
                    <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-success text-sm bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                        {success}
                    </p>
                )}

                {/* Preview button */}
                <button
                    onClick={() => setPreviewOpen(true)}
                    className="px-4 py-2 rounded-full border border-border text-foreground hover:border-brand-500 hover:text-brand-500 transition-colors flex items-center gap-2 self-start"
                >
                    <Eye className="w-4 h-4" />
                    Preview Profile
                </button>

                {/* Preview modal */}
                {previewOpen && profileViewData && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setPreviewOpen(false)}
                    >
                        <div className="relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setPreviewOpen(false)}
                                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-surface border border-border text-foreground flex items-center justify-center hover:bg-hover transition-colors shadow-lg"
                            >
                                <X size={20} />
                            </button>
                            <div className="max-h-[90vh] overflow-y-auto">
                                <ProfileView person={profileViewData} />
                            </div>
                            <p className="text-center text-muted text-sm mt-4">
                                This is how others see your profile
                            </p>
                        </div>
                    </div>
                )}

                {/* ── PHOTOS ── */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-foreground">Photos</h2>
                        {photos.length < 6 && (
                            <button
                                onClick={() => photoInput.current?.click()}
                                disabled={uploading}
                                className="text-sm text-brand-500 hover:text-brand-400 transition-colors disabled:opacity-40"
                            >
                                {uploading ? 'Uploading...' : '+ Add photo'}
                            </button>
                        )}
                        <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>

                    {photos.length === 0 ? (
                        <p className="text-muted text-sm italic">No photos yet — add one to appear in the swipe queue</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {photos.map(photo => (
                                <div
                                    key={photo._id}
                                    onClick={() => setSelectedPhotoId(prev => prev === photo._id ? null : photo._id)}
                                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${selectedPhotoId === photo._id ? 'ring-2 ring-brand-500 scale-95' : ''}`}
                                >
                                    <img src={photo.url} alt="profile" className="w-full h-full object-cover" />
                                    {photo.isPrimary && (
                                        <div className="absolute top-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            Main
                                        </div>
                                    )}
                                    {selectedPhotoId === photo._id && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                                <Check className="text-white w-3 h-3" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-subtle text-xs mt-2">{photos.length}/6 photos</p>

                    {selectedPhotoId && (() => {
                        const idx = photos.findIndex(p => p._id === selectedPhotoId)
                        const photo = photos[idx]
                        if (!photo) return null
                        return (
                            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { handleMovePhoto(photo._id, 'left'); setSelectedPhotoId(null) }}
                                        disabled={idx === 0}
                                        className="flex-1 py-2 rounded-xl bg-hover text-foreground text-sm disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Move left
                                    </button>
                                    <button
                                        onClick={() => { handleMovePhoto(photo._id, 'right'); setSelectedPhotoId(null) }}
                                        disabled={idx === photos.length - 1}
                                        className="flex-1 py-2 rounded-xl bg-hover text-foreground text-sm disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        Move right <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {!photo.isPrimary && (
                                        <button
                                            onClick={() => { handleSetPrimary(photo._id); setSelectedPhotoId(null) }}
                                            className="text-xs text-white bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            Set main
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handleDeletePhoto(photo._id); setSelectedPhotoId(null) }}
                                        className="text-xs text-white bg-error hover:opacity-90 px-3 py-1.5 rounded-full disabled:opacity-50 transition-opacity"
                                        disabled={photos.length === 1}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {photos.length === 1 && (
                                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-xs">
                                        You must have at least one photo. Add more before deleting this one.
                                    </div>
                                )}
                                <button onClick={() => setSelectedPhotoId(null)} className="text-muted text-xs text-center hover:text-foreground transition-colors">
                                    Cancel
                                </button>
                            </div>
                        )
                    })()}
                </div>

                {/* ── BASIC INFO ── */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-foreground">Basic Info</h2>
                        {editing !== 'basicInfo' ? (
                            <button className="text-sm text-brand-500 hover:text-brand-400 transition-colors" onClick={() => setEditing('basicInfo')}>Edit</button>
                        ) : (
                            <div className="flex gap-3">
                                <button className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => { setEditing(null); setFieldErrors({}) }}>Cancel</button>
                                <button className="text-sm text-brand-500 font-semibold hover:text-brand-400 transition-colors" onClick={saveBasicInfo} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {editing === 'basicInfo' ? (
                        <div className="flex flex-col gap-2">
                            <input className={inputCls} placeholder="First name" value={basicEdit.firstName} onChange={e => setBasicEdit(p => ({ ...p, firstName: e.target.value }))} />
                            <input className={inputCls} placeholder="Last name" value={basicEdit.lastName} onChange={e => setBasicEdit(p => ({ ...p, lastName: e.target.value }))} />
                            <input
                                type="number"
                                className={inputCls}
                                placeholder="Age"
                                value={basicEdit.age ?? ''}
                                onChange={e => setBasicEdit(p => ({ ...p, age: e.target.value === '' ? null : Number(e.target.value) }))}
                                onBlur={() => {
                                    if (!basicEdit.age || basicEdit.age < 18 || basicEdit.age > 99)
                                        setFieldErrors(p => ({ ...p, age: 'Age must be between 18 and 99' }))
                                    else
                                        setFieldErrors(p => { const n = { ...p }; delete n.age; return n })
                                }}
                            />
                            {fieldErrors.age && <p className="text-error text-xs">{fieldErrors.age}</p>}
                            <select className={selectCls} value={basicEdit.gender} onChange={e => setBasicEdit(p => ({ ...p, gender: e.target.value }))}>
                                <option value="">Select gender</option>
                                {GENDER_OPTIONS.filter(g => g !== 'Unspecified').map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <select className={selectCls} value={basicEdit.major} onChange={e => setBasicEdit(p => ({ ...p, major: e.target.value }))}>
                                <option value="">Select major</option>
                                {MAJOR_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select className={selectCls} value={basicEdit.classYear} onChange={e => setBasicEdit(p => ({ ...p, classYear: e.target.value }))}>
                                <option value="">Select class year</option>
                                {CLASS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="text-muted text-sm flex flex-col gap-1">
                            <p className="font-medium text-foreground">{user.basicInfo?.firstName} {user.basicInfo?.lastName}</p>
                            <p>Age: {user.basicInfo?.age ?? '—'}</p>
                            <p>Gender: {user.basicInfo?.gender ?? '—'}</p>
                            <p>Major: {user.basicInfo?.major ?? '—'}</p>
                            <p>Class year: {user.basicInfo?.classYear ?? '—'}</p>
                        </div>
                    )}
                </div>

                {/* ── PROFILE ── */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-foreground">Profile</h2>
                        {editing !== 'profile' ? (
                            <button className="text-sm text-brand-500 hover:text-brand-400 transition-colors" onClick={() => setEditing('profile')}>Edit</button>
                        ) : (
                            <div className="flex gap-3">
                                <button className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => { setEditing(null); setFieldErrors({}) }}>Cancel</button>
                                <button className="text-sm text-brand-500 font-semibold hover:text-brand-400 transition-colors" onClick={saveProfile} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {editing === 'profile' ? (
                        <div className="flex flex-col gap-3">
                            <textarea
                                className={`${inputCls} resize-none`}
                                placeholder="Bio (max 500 chars)"
                                maxLength={500}
                                rows={3}
                                value={profileEdit.bio}
                                onChange={e => setProfileEdit(p => ({ ...p, bio: e.target.value }))}
                            />
                            <select
                                className={selectCls}
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
                                <p className="text-muted text-xs">Prompts (up to 3)</p>
                                {profileEdit.prompts.map((prompt, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <select
                                            className={selectCls}
                                            value={prompt.question}
                                            onChange={e => {
                                                const updated = [...profileEdit.prompts]
                                                updated[i] = { ...updated[i], question: e.target.value }
                                                setProfileEdit(p => ({ ...p, prompts: updated }))
                                            }}
                                        >
                                            {PROMPT_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                        <div className="flex gap-2">
                                            <input
                                                className={inputCls}
                                                placeholder="Your answer..."
                                                value={prompt.answer}
                                                onChange={e => {
                                                    const updated = [...profileEdit.prompts]
                                                    updated[i] = { ...updated[i], answer: e.target.value }
                                                    setProfileEdit(p => ({ ...p, prompts: updated }))
                                                }}
                                            />
                                            <button
                                                className="text-error hover:opacity-70 transition-opacity px-2"
                                                onClick={() => setProfileEdit(p => ({ ...p, prompts: p.prompts.filter((_, j) => j !== i) }))}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {profileEdit.prompts.length < 3 && (
                                    <button
                                        className="text-brand-500 hover:text-brand-400 text-sm self-start transition-colors"
                                        onClick={() => setProfileEdit(p => ({ ...p, prompts: [...p.prompts, { question: PROMPT_LIST[0], answer: '' }] }))}
                                    >
                                        + Add prompt
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted text-sm flex flex-col gap-2">
                            <p className="text-foreground">{user.profile?.bio || <span className="text-subtle italic">No bio yet</span>}</p>
                            {user.profile?.datingIntentions && (
                                <p>Looking for: {user.profile.datingIntentions}</p>
                            )}
                            {user.profile?.promptAnswers?.map((p, i) => (
                                <div key={i} className="bg-hover rounded-lg p-2 border border-border">
                                    <p className="text-subtle text-xs">{p.question}</p>
                                    <p className="text-foreground">{p.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── PREFERENCES ── */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-foreground">Preferences</h2>
                        {editing !== 'preferences' ? (
                            <button className="text-sm text-brand-500 hover:text-brand-400 transition-colors" onClick={() => setEditing('preferences')}>Edit</button>
                        ) : (
                            <div className="flex gap-3">
                                <button className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => setEditing(null)}>Cancel</button>
                                <button className="text-sm text-brand-500 font-semibold hover:text-brand-400 transition-colors" onClick={savePreferences} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {editing === 'preferences' ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3 items-center">
                                <div className="flex gap-2 items-center flex-1">
                                    <label className="text-muted text-sm shrink-0">Min</label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={prefsEdit.ageMin ?? ''}
                                        onChange={e => setPrefsEdit(p => ({ ...p, ageMin: e.target.value === '' ? null : Number(e.target.value) }))}
                                        onBlur={() => {
                                            if (!prefsEdit.ageMin || prefsEdit.ageMin < 18 || prefsEdit.ageMin > 99)
                                                setFieldErrors(p => ({ ...p, ageMin: 'Must be between 18 and 99' }))
                                            else
                                                setFieldErrors(p => { const n = { ...p }; delete n.ageMin; return n })
                                        }}
                                    />
                                </div>
                                <div className="flex gap-2 items-center flex-1">
                                    <label className="text-muted text-sm shrink-0">Max</label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={prefsEdit.ageMax ?? ''}
                                        onChange={e => setPrefsEdit(p => ({ ...p, ageMax: e.target.value === '' ? null : Number(e.target.value) }))}
                                        onBlur={() => {
                                            if (!prefsEdit.ageMax || prefsEdit.ageMax < 18 || prefsEdit.ageMax > 99)
                                                setFieldErrors(p => ({ ...p, ageMax: 'Must be between 18 and 99' }))
                                            else
                                                setFieldErrors(p => { const n = { ...p }; delete n.ageMax; return n })
                                        }}
                                    />
                                </div>
                            </div>
                            {(fieldErrors.ageMin || fieldErrors.ageMax) && (
                                <p className="text-error text-xs">{fieldErrors.ageMin || fieldErrors.ageMax}</p>
                            )}
                            <div>
                                <p className="text-muted text-sm mb-2">Interested in</p>
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
                                                    ? 'bg-brand-500 border-brand-500 text-white'
                                                    : 'border-border text-muted hover:border-brand-500 hover:text-brand-500'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setPrefsEdit(p => ({ ...p, interestedInGenders: [...ALL_GENDERS] }))}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            ALL_GENDERS.every(g => prefsEdit.interestedInGenders.includes(g))
                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                : 'border-border text-muted hover:border-brand-500 hover:text-brand-500'
                                        }`}
                                    >
                                        All
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted text-sm flex flex-col gap-1">
                            <p>Age range: {user.preferences?.ageMin ?? 18} – {user.preferences?.ageMax ?? 99}</p>
                            <p>Interested in: {user.preferences?.interestedInGenders?.join(', ') || '—'}</p>
                        </div>
                    )}
                </div>

                {/* ── ACCOUNT ── */}
                <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
                    <h2 className="font-semibold text-foreground mb-1">Account</h2>
                    <p className="text-muted text-sm">{user.email}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full py-2 rounded-lg bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors"
                    >
                        Log out
                    </button>
                </div>

            </div>
        </div>
    )
}