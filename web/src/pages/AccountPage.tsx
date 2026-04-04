import React, { useState, useEffect } from "react"
import axios from "axios"
import { api } from "../api"

import { GENDER_OPTIONS, INTEREST_OPTIONS, ETHNICITY_OPTIONS, RELIGION_OPTIONS, POLITICS_OPTIONS, DATING_INTENTION_OPTIONS, MAJOR_LIST, CLASS_YEAR_OPTIONS, PROMPT_LIST } from "../constants/profileOptions"
interface Prompt {
    question: string
    answer: string
}

interface Profile {
    
    firstName: string
    lastName: string
    age: number
    photos: string[]
    prompts: Prompt[]

    identity: {
        gender: string
        genderCustom: string
        interestedIn: string[]
    }
    vitals: {
        height: number
        ethnicity: string
        major: string
        classYear: string
    }
    lifestyle: {
        religion: string
        politics: string
        datingIntention: string
        hometown: string
        work: string
    }
}

export default function AccountPage() {

    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<null | string>(null)
    const [successMessage, setSuccessMessage] = useState<null | string>(null)

    // Section expand/collapse
    const [openSection, setOpenSection] = useState<null | string>(null)

    useEffect(() => {
        async function fetchProfile() {
            setError(null)
            try {
                const data = await api.profile.getProfile()  // WIP: replace with real api path
                setProfile(data)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message ?? 'Failed to load profile')
                } else {
                    setError('Failed to load profile')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    async function handleSave() {
        setSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            await api.profile.updateProfile(profile)  // WIP: replace with real api path
            setSuccessMessage('Profile saved!')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'Failed to save profile')
            } else {
                setError('Failed to save profile')
            }
        } finally {
            setSaving(false)
        }
    }

    // Generic field updater to avoid rewriting setState for every field
    function updateField(section: keyof Profile, field: string, value: string | string[] | number) {
        setProfile(prev => {
            if (!prev) return prev
            return {
                ...prev,
                [section]: {
                    ...(prev[section] as object),
                    [field]: value
                }
            }
        })
    }

    function updatePrompt(index: number, field: 'question' | 'answer', value: string) {
        setProfile(prev => {
            if (!prev) return prev
            const updatedPrompts = [...prev.prompts]
            updatedPrompts[index] = { ...updatedPrompts[index], [field]: value }
            return { ...prev, prompts: updatedPrompts }
        })
    }

    function addPrompt() {
        setProfile(prev => {
            if (!prev) return prev
            if (prev.prompts.length >= 3) return prev  // cap at 3 prompts
            return { ...prev, prompts: [...prev.prompts, { question: PROMPT_LIST[0], answer: "" }] }
        })
    }

    function removePrompt(index: number) {
        setProfile(prev => {
            if (!prev) return prev
            const updatedPrompts = prev.prompts.filter((_, i) => i !== index)
            return { ...prev, prompts: updatedPrompts }
        })
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const formData = new FormData()
            formData.append('photo', file)
            const { url } = await api.profile.uploadPhoto(formData)  // WIP: replace with real api path
            setProfile(prev => {
                if (!prev) return prev
                return { ...prev, photos: [...prev.photos, url] }
            })
        } catch (err) {
            setError('Failed to upload photo')
        }
    }

    function removePhoto(index: number) {
        setProfile(prev => {
            if (!prev) return prev
            const updatedPhotos = prev.photos.filter((_, i) => i !== index)
            return { ...prev, photos: updatedPhotos }
        })
    }

    function toggleSection(section: string) {
        setOpenSection(prev => prev === section ? null : section)
    }

    if (loading) return <p>Loading profile...</p>
    if (!profile) return <p>Could not load profile.</p>

    return (
        <div>
            <h1 className='text-white p-4'>Your Profile</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            {/* ── PHOTOS ── */}
            <div>
                <button onClick={() => toggleSection('photos')}>
                    Photos {openSection === 'photos' ? '▲' : '▼'}
                </button>

                {openSection === 'photos' && (
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {profile.photos.map((url, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <img src={url} alt={`photo ${i + 1}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                                    <button onClick={() => removePhoto(i)}>✕</button>
                                </div>
                            ))}
                        </div>

                        {profile.photos.length < 6 && (  //cap at 6 photos
                            <div>
                                <label htmlFor="photo-upload">Upload Photo</label>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── PROMPTS ── */}
            <div>
                <button onClick={() => toggleSection('prompts')}>
                    Prompts {openSection === 'prompts' ? '▲' : '▼'}
                </button>

                {openSection === 'prompts' && (
                    <div>
                        {profile.prompts.map((prompt, i) => (
                            <div key={i}>
                                <select
                                    value={prompt.question}
                                    onChange={e => updatePrompt(i, 'question', e.target.value)}
                                >
                                    {PROMPT_LIST.map(q => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={prompt.answer}
                                    onChange={e => updatePrompt(i, 'answer', e.target.value)}
                                />
                                <button onClick={() => removePrompt(i)}>Remove</button>
                            </div>
                        ))}

                        {profile.prompts.length < 3 && (
                            <button onClick={addPrompt}>+ Add Prompt</button>
                        )}
                    </div>
                )}
            </div>

            <label>First Name</label>
            <input
                type="text"
                value={profile.firstName}
                onChange={e => setProfile(prev => prev ? { ...prev, firstName: e.target.value } : prev)}
            />

            <label>Last Name</label>
            <input
                type="text"
                value={profile.lastName}
                onChange={e => setProfile(prev => prev ? { ...prev, lastName: e.target.value } : prev)}
            />

            {/* ── IDENTITY ── */}
            <div>
                <button onClick={() => toggleSection('identity')}>
                    Identity {openSection === 'identity' ? '▲' : '▼'}
                </button>

                {openSection === 'identity' && (
                    <div>
                        <label>Gender</label>
                            <select
                                value={profile.identity.gender}
                                onChange={e => updateField('identity', 'gender', e.target.value)}
                            >
                                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>

                            {profile.identity.gender === "Other" && (
                                <input
                                    type="text"
                                    placeholder="Describe your gender identity..."
                                    value={profile.identity.genderCustom}
                                    onChange={e => updateField('identity', 'genderCustom', e.target.value)}
                                />
                            )}

                        <label>Interested In</label>
                        <div>
                            {INTEREST_OPTIONS.map(option => (
                                <div key={option}>
                                    <input
                                        type="checkbox"
                                        id={option}
                                        checked={profile.identity.interestedIn.includes(option)}
                                        onChange={e => {
                                            const updated = e.target.checked
                                                ? [...profile.identity.interestedIn, option]
                                                : profile.identity.interestedIn.filter(o => o !== option)
                                            updateField('identity', 'interestedIn', updated)
                                        }}
                                    />
                                    <label htmlFor={option}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── VITALS ── */}
            <div>
                <button onClick={() => toggleSection('vitals')}>
                    Vitals {openSection === 'vitals' ? '▲' : '▼'}
                </button>

                {openSection === 'vitals' && (
                    <div>
                        <label>Age</label>
                            <p>{profile.age}</p>

                        <label>Height: {Math.floor(profile.vitals.height / 12)}'{profile.vitals.height % 12}"</label>
                            <input
                                type="range"
                                min={48}   // 4'0"
                                max={96}   // 8'0"
                                value={profile.vitals.height}
                                onChange={e => updateField('vitals', 'height', Number(e.target.value))}
                            />

                        <label>Ethnicity</label>
                        <select
                            value={profile.vitals.ethnicity}
                            onChange={e => updateField('vitals', 'ethnicity', e.target.value)}
                        >
                            {ETHNICITY_OPTIONS.map(eth => <option key={eth} value={eth}>{eth}</option>)}
                        </select>

                        <label>Major</label>
                        <select
                            value={profile.vitals.major}
                            onChange={e => updateField('vitals', 'major', e.target.value)}
                        >
                            {MAJOR_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <label>Class Year</label>
                        <select
                            value={profile.vitals.classYear}
                            onChange={e => updateField('vitals', 'classYear', e.target.value)}
                        >
                            {CLASS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* ── LIFESTYLE ── */}
            <div>
                <button onClick={() => toggleSection('lifestyle')}>
                    Lifestyle {openSection === 'lifestyle' ? '▲' : '▼'}
                </button>

                {openSection === 'lifestyle' && (
                    <div>
                        <label>Hometown</label>
                        <input
                            type="text"
                            placeholder="e.g. Orlando, FL"
                            value={profile.lifestyle.hometown}
                            onChange={e => updateField('lifestyle', 'hometown', e.target.value)}
                        />

                        <label>Work</label>
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            value={profile.lifestyle.work}
                            onChange={e => updateField('lifestyle', 'work', e.target.value)}
                        />

                        <label>Religion</label>
                        <select
                            value={profile.lifestyle.religion}
                            onChange={e => updateField('lifestyle', 'religion', e.target.value)}
                        >
                            {RELIGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>

                        <label>Politics</label>
                        <select
                            value={profile.lifestyle.politics}
                            onChange={e => updateField('lifestyle', 'politics', e.target.value)}
                        >
                            {POLITICS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <label>Dating Intention</label>
                        <select
                            value={profile.lifestyle.datingIntention}
                            onChange={e => updateField('lifestyle', 'datingIntention', e.target.value)}
                        >
                            {DATING_INTENTION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* ── SAVE ── */}
            <button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
            </button>

        </div>
    )
}