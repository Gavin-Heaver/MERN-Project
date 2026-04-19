import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import {
    GENDER_OPTIONS,
    MAJOR_LIST,
    CLASS_YEAR_OPTIONS,
    ALL_GENDERS,
    PROMPT_LIST,
    DATING_INTENTION_OPTIONS
} from '../constants/profileOptions'
import axios, { isAxiosError } from "axios"
import { useAuth } from "../context/AuthContext"

type Step = 'basic' | 'preferences' | 'profile' | 'photos'

const STEPS: Step[] = ['basic', 'preferences', 'profile', 'photos']
const STEP_LABELS = ['About You', 'Preferences', 'Your Profile', 'Photos']

const inputCls = "w-full rounded-xl px-4 py-3 bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
const selectCls = "w-full rounded-xl px-4 py-3 bg-surface border border-border focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm [&>option]:text-black [&>option]:bg-white"

export default function SetupPage() {
    const navigate = useNavigate()
    const { refreshUser } = useAuth()

    const [step, setStep] = useState<Step>('basic')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [major, setMajor] = useState('')
    const [classYear, setClassYear] = useState('')

    const [ageMin, setAgeMin] = useState(18)
    const [ageMax, setAgeMax] = useState(99)
    const [interestedInGenders, setInterestedInGenders] = useState<string[]>([])

    const [bio, setBio] = useState('')
    const [datingIntentions, setDatingIntentions] = useState('')
    const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([])

    const [photos, setPhotos] = useState<{ url: string; publicId: string }[]>([])
    const [uploading, setUploading] = useState(false)

    const stepIndex = STEPS.indexOf(step)

    async function handleBasic() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updateBasicInfo({
                firstName, lastName, age: Number(age), gender, major, classYear
            })
            setStep('preferences')
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed to save') : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function handlePreferences() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updatePreferences({ ageMin, ageMax, interestedInGenders })
            setStep('profile')
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed to save') : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function handleProfile() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updateProfile({
                bio, photos: [], promptAnswers: prompts, interestTagIds: [], datingIntentions
            })
            setStep('photos')
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed to save') : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return
        setUploading(true)
        setError(null)
        try {
            const file = files[0]
            if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
            if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return }
            const formData = new FormData()
            formData.append('photo', file)
            const result = await api.profile.uploadPhoto(formData)
            setPhotos(prev => [...prev, result])
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed to upload photo') : 'Failed to upload photo')
        } finally {
            setUploading(false)
        }
    }

    async function handleRemovePhoto(publicId: string) {
        try {
            await api.profile.deletePhoto(publicId)
            setPhotos(prev => prev.filter(p => p.publicId !== publicId))
        } catch (err) {
            setError(isAxiosError(err) ? (err.response?.data.message ?? 'Failed to remove photo') : 'Failed to remove photo')
        }
    }

    async function handleCompleteSetup() {
        if (photos.length === 0) { setError('Please upload at least one photo'); return }
        setError(null)
        setSaving(true)
        try {
            await api.users.updateProfile({
                bio, photos, promptAnswers: prompts, interestTagIds: [], datingIntentions
            })
            await refreshUser()
            navigate('/people')
        } catch (err) {
            setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed to complete setup') : 'Failed to complete setup')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-start p-4 pt-10">

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

            {/* Progress bar */}
            <div className="relative z-10 w-full max-w-md mb-8">
                <div className="flex mb-2">
                    {STEP_LABELS.map((label, i) => (
                        <div key={label} className="flex-1 flex justify-center">
                            <span className={`text-xs font-medium transition-colors ${i <= stepIndex ? 'text-foreground' : 'text-subtle'}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-brand-500' : 'bg-surface-elevated'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">

                {/* ── BASIC ── */}
                {step === 'basic' && (
                    <>
                        <h1 className="text-xl font-bold text-foreground">Tell us about yourself</h1>

                        <input className={inputCls} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input className={inputCls} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                        <input
                            type="number"
                            className={inputCls}
                            placeholder="Age"
                            min={18} max={99}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                        />

                        <div className="flex flex-col gap-1">
                            <p className="text-muted text-xs font-medium">Gender</p>
                            <select
                                className={`${selectCls} ${!gender ? 'text-muted' : 'text-foreground'}`}
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                            >
                                <option value="" disabled hidden>Unselected</option>
                                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-muted text-xs font-medium">Major</p>
                            <select
                                className={`${selectCls} ${!major ? 'text-muted' : 'text-foreground'}`}
                                value={major}
                                onChange={e => setMajor(e.target.value)}
                            >
                                <option value="" disabled hidden>Unselected</option>
                                {MAJOR_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-muted text-xs font-medium">Class Year</p>
                            <select
                                className={`${selectCls} ${!classYear ? 'text-muted' : 'text-foreground'}`}
                                value={classYear}
                                onChange={e => setClassYear(e.target.value)}
                            >
                                <option value="" disabled hidden>Unselected</option>
                                {CLASS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

                        <button
                            onClick={handleBasic}
                            disabled={saving || !firstName || !lastName || !age || !major || !classYear}
                            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold disabled:opacity-40 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Continue →'}
                        </button>
                    </>
                )}

                {/* ── PREFERENCES ── */}
                {step === 'preferences' && (
                    <>
                        <h1 className="text-xl font-bold text-foreground">Who are you looking for?</h1>

                        <div>
                            <p className="text-muted text-sm mb-2">I'm interested in</p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_GENDERS.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setInterestedInGenders(prev =>
                                            prev.includes(opt) ? prev.filter(g => g !== opt) : [...prev, opt]
                                        )}
                                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                                            interestedInGenders.includes(opt)
                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                : 'border-border text-muted hover:border-brand-500 hover:text-brand-500'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setInterestedInGenders([...ALL_GENDERS])}
                                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                                        ALL_GENDERS.every(g => interestedInGenders.includes(g))
                                            ? 'bg-brand-500 border-brand-500 text-white'
                                            : 'border-border text-muted hover:border-brand-500 hover:text-brand-500'
                                    }`}
                                >
                                    All
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-muted text-sm mb-2">Age range</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="w-20 rounded-xl px-3 py-3 bg-surface border border-border text-foreground outline-none text-center focus:ring-1 focus:ring-brand-500 text-sm"
                                    min={18} max={99}
                                    value={ageMin}
                                    onChange={e => setAgeMin(Number(e.target.value))}
                                />
                                <span className="text-muted">to</span>
                                <input
                                    type="number"
                                    className="w-20 rounded-xl px-3 py-3 bg-surface border border-border text-foreground outline-none text-center focus:ring-1 focus:ring-brand-500 text-sm"
                                    min={18} max={99}
                                    value={ageMax}
                                    onChange={e => setAgeMax(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('basic')}
                                className="flex-1 py-3 rounded-xl border border-border text-muted text-sm hover:bg-hover transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handlePreferences}
                                disabled={saving || interestedInGenders.length === 0}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold disabled:opacity-40 transition-colors"
                            >
                                {saving ? 'Saving...' : 'Continue →'}
                            </button>
                        </div>
                    </>
                )}

                {/* ── PROFILE ── */}
                {step === 'profile' && (
                    <>
                        <h1 className="text-xl font-bold text-foreground">Set up your profile</h1>

                        <div>
                            <p className="text-muted text-sm mb-1">Bio</p>
                            <textarea
                                className="w-full rounded-xl px-4 py-3 bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm resize-none"
                                placeholder="Tell people about yourself..."
                                rows={3}
                                maxLength={500}
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            />
                            <p className="text-subtle text-xs text-right">{bio.length}/500</p>
                        </div>

                        <div>
                            <p className="text-muted text-sm mb-1">Dating intention</p>
                            <select
                                className={`${selectCls} ${!datingIntentions ? 'text-muted' : 'text-foreground'}`}
                                value={datingIntentions}
                                onChange={e => setDatingIntentions(e.target.value)}
                            >
                                <option value="" disabled hidden>Unselected</option>
                                {DATING_INTENTION_OPTIONS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <p className="text-muted text-sm">Prompts (up to 3)</p>
                                {prompts.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setPrompts(p => [...p, { question: PROMPT_LIST[0], answer: '' }])}
                                        className="text-brand-500 hover:text-brand-400 text-sm transition-colors"
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>

                            {prompts.map((prompt, i) => (
                                <div key={i} className="flex flex-col gap-1 bg-hover border border-border rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                        <select
                                            className="flex-1 bg-transparent text-foreground text-sm outline-none [&>option]:text-black [&>option]:bg-white"
                                            value={prompt.question}
                                            onChange={e => {
                                                const updated = [...prompts]
                                                updated[i] = { ...updated[i], question: e.target.value }
                                                setPrompts(updated)
                                            }}
                                        >
                                            {PROMPT_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setPrompts(p => p.filter((_, j) => j !== i))}
                                            className="text-muted hover:text-error text-sm ml-2 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <input
                                        className="bg-transparent text-foreground text-sm outline-none placeholder-muted border-t border-border pt-2 mt-1"
                                        placeholder="Your answer..."
                                        value={prompt.answer}
                                        onChange={e => {
                                            const updated = [...prompts]
                                            updated[i] = { ...updated[i], answer: e.target.value }
                                            setPrompts(updated)
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('preferences')}
                                className="flex-1 py-3 rounded-xl border border-border text-muted text-sm hover:bg-hover transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleProfile}
                                disabled={saving || !bio || !datingIntentions}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold disabled:opacity-40 transition-colors"
                            >
                                {saving ? 'Saving...' : 'Continue →'}
                            </button>
                        </div>
                    </>
                )}

                {/* ── PHOTOS ── */}
                {step === 'photos' && (
                    <>
                        <h1 className="text-xl font-bold text-foreground">Add your photos</h1>
                        <p className="text-muted text-sm">Upload at least one photo to continue</p>

                        <div className="grid grid-cols-3 gap-3">
                            {photos.map((photo, i) => (
                                <div key={photo.publicId} className="relative aspect-square rounded-xl overflow-hidden bg-surface-elevated border border-border">
                                    <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => handleRemovePhoto(photo.publicId)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black transition-colors"
                                    >
                                        ✕
                                    </button>
                                    {i === 0 && (
                                        <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-medium">
                                            Primary
                                        </div>
                                    )}
                                </div>
                            ))}

                            {photos.length < 6 && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-elevated">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    {uploading ? (
                                        <div className="text-muted text-xs">Uploading...</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl text-muted mb-1">+</div>
                                            <div className="text-xs text-muted">Add Photo</div>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>

                        <p className="text-subtle text-xs leading-relaxed">
                            • First photo will be your profile picture<br />
                            • Maximum 6 photos<br />
                            • Images must be less than 5MB
                        </p>

                        {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('profile')}
                                className="flex-1 py-3 rounded-xl border border-border text-muted text-sm hover:bg-hover transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleCompleteSetup}
                                disabled={saving || photos.length === 0}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold disabled:opacity-40 transition-colors"
                            >
                                {saving ? 'Completing...' : "Let's go! 🎉"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}