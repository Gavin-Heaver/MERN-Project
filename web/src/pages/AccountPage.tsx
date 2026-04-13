import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import type { FullUser } from '../types'
import { GENDER_OPTIONS, INTEREST_OPTIONS, MAJOR_LIST, CLASS_YEAR_OPTIONS, PROMPT_LIST } from "../constants/profileOptions"
import axios from "axios"

type Section = 'basicInfo' | 'profile' | 'preferences' | null

export default function AccountPage() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const [user, setUser] = useState<FullUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [editing, setEditing] = useState<Section>(null)

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
            await api.users.updateProfile({
                bio: profileEdit.bio,
                datingIntentions: profileEdit.datingIntentions,
                photos: user?.profile?.photos?.map(p => ({ url: p.url, publicId: p.publicId })) ?? [],
                promptAnswers: profileEdit.prompts,
                interestTagIds: user?.profile?.interestTagIds ?? []
            })
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

    function handleLogout() {
        logout()
        navigate('/login')
    }

    if (loading) return <p className="p-4">Loading...</p>
    if (!user) return <p className="p-4 text-red-500">{error ?? 'Could not load profile'}</p>

    return (
        <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
            <div className="flex flex-col justify-between items-center mb-3">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <h1 className="text-xl font-bold text-white">Your Profile</h1>

                <div className="bg-white/10 rounded-xl p-4">
                    <h2 className="font-semibold text-white">Basic Info</h2>
                    {editing !== 'basicInfo'
                        ? <button className="text-sm text-indigo-400" onClick={() => setEditing('basicInfo')}>Edit</button>
                        :
                            <div className="flex gap-2">
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
                            <input className="flex-1 rounded-lg p-2 bg-white/20 text-white placeholder-white/50" placeholder="Last name" value={basicEdit.lastName} onChange={e => setBasicEdit(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                        <input type="number" className="rounded-lg p-2 bg-white/20 text-white" placeholder="Age" min={18} max={99} value={basicEdit.age} onChange={e => setBasicEdit(p => ({ ...p, age: Number(e.target.value) }))} />
                        <select className="rounded-lg p-2 bg-white/20 text-white" value={basicEdit.gender} onChange={e => setBasicEdit(p => ({ ...p, gender: e.target.value }))}>
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
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
                        <p>{user.basicInfo?.firstName} {user.basicInfo?.lastName}</p>
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
                        <div className="flex gap-2 items-center">
                            <label className="text-white/60 text-sm w-20">Age min</label>
                            <input type="number" className="flex-1 rounded-lg p-2 bg-white/20 text-white" min={18} max={99} value={prefsEdit.ageMin} onChange={e => setPrefsEdit(p => ({ ...p, ageMin: Number(e.target.value) }))} />
                        </div>
                        <div className="flex gap-2 items-center">
                            <label className="text-white/60 text-sm w-20">Age max</label>
                            <input type="number" className="flex-1 rounded-lg p-2 bg-white/20 text-white" min={18} max={99} value={prefsEdit.ageMax} onChange={e => setPrefsEdit(p => ({ ...p, ageMax: Number(e.target.value) }))} />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-1">Interested in</p>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setPrefsEdit(p => ({
                                            ...p,
                                            interestedInGenders: p.interestedInGenders.includes(opt)
                                                ? p.interestedInGenders.filter(g => g !== opt)
                                                : [...p.interestedInGenders, opt]
                                        }))}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${prefsEdit.interestedInGenders.includes(opt) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/30 text-white/60'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
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