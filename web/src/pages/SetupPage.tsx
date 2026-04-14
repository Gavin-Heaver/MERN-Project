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
import axios from "axios"

type Step = 'basic' | 'preferences' | 'profile'

const STEPS: Step[] = ['basic', 'preferences', 'profile']
const STEP_LABELS = ['About You', 'Preferences', 'Your Profile']

export default function SetupPage() {
    const navigate = useNavigate()

    const [step, setStep] = useState<Step>('basic')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('Unspecified')
    const [major, setMajor] = useState('')
    const [classYear, setClassYear] = useState('')

    const [ageMin, setAgeMin] = useState(18)
    const [ageMax, setAgeMax] = useState(99)
    const [interestedInGenders, setInterestedInGenders] = useState<string[]>([])

    const [bio, setBio] = useState('')
    const [datingIntentions, setDatingIntentions] = useState('')
    const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([])

    const stepIndex = STEPS.indexOf(step)

    async function handleBasic() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updateBasicInfo({
                firstName,
                lastName,
                age: Number(age),
                gender: gender,
                major,
                classYear
            })
            setStep('preferences')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to save')
                : 'Failed to save'
            )
        } finally {
            setSaving(false)
        }
    }

    async function handlePreferences() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updatePreferences({
                ageMin,
                ageMax,
                interestedInGenders
            })
            setStep('profile')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to save')
                : 'Failed to save'
            )
        } finally {
            setSaving(false)
        }
    }

    async function handleProfile() {
        setError(null)
        setSaving(true)
        try {
            await api.users.updateProfile({
                bio,
                photos: [],
                promptAnswers: prompts,
                interestTagIds: [],
                datingIntentions
            })
            navigate('/people')
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Failed to save')
                : 'Failed to save'
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-10">
            <div className="w-full max-w-md mb-8">
                <div className="flex justify-between mb-2">
                    {STEP_LABELS.map((label, i) => (
                        <span
                            key={label}
                            className={`text-xs font-medium ${i <= stepIndex ? 'text-white' : 'text-white/30'}`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex gap-1">
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-pink-500' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md bg-white/10 rounded-2xl p-6 flex flex-col gap-4">
                {step === 'basic' && (
                    <>
                        <h1 className="text-xl font-bold text-white">Tell us about yourself</h1>
                        <input
                            className="flex-1 rounded-xl p-3 bg-white/20 text-white placeholder-white/40 outline-none"
                            placeholder="First name"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                        <input
                            className="flex-1 rounded-xl p-3 bg-white/20 text-white placeholder-white/40 outline-none"
                            placeholder="Last name"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />

                        <input
                            type="number"
                            className="rounded-xl p-3 bg-white/20 text-white placeholder-white/40 outline-none"
                            placeholder="Age"
                            min={18}
                            max={99}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                        />

                        <select
                            className="rounded-xl p-3 bg-white/20 text-white outline-none"
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                        >
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>

                        <select
                            className="rounded-xl p-3 bg-white/20 text-white outline-none"
                            value={major}
                            onChange={e => setMajor(e.target.value)}
                        >
                            <option value="" disabled>Select your major</option>
                            {MAJOR_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <select
                            className="rounded-xl p-3 bg-white/20 text-white outline-none"
                            value={classYear}
                            onChange={e => setClassYear(e.target.value)}
                        >
                            <option value="" disabled>Select your class year</option>
                            {CLASS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            onClick={handleBasic}
                            disabled={saving || !firstName || !lastName || !age || !major || !classYear}
                            className="w-full py-3 rounded-xl bg-pink-500 text-white font-semibold disabled:opacity-40 transition-opacity"
                        >
                            {saving ? 'Saving...' : 'Continue →'}
                        </button>
                    </>
                )}

                {step === 'preferences' && (
                    <>
                        <h1 className="text-xl font-bold text-white">Who are you looking for?</h1>

                        <div>
                            <p className="text-white/60 text-sm mb-2">I'm interested in</p>
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
                                                ? 'bg-pink-500 border-pink-500 text-white'
                                                : 'border-white/30 text-white/60'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setInterestedInGenders([...ALL_GENDERS])}
                                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${ALL_GENDERS.every(g => interestedInGenders.includes(g))
                                        ? 'bg-pink-500 border-pink-500 text-white'
                                        : 'border-white/30 text-white/60'
                                    }`}
                                >
                                    All
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-white/60 text-sm mb-2">Age range</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="w-20 rounded-xl p-3 bg-white/20 text-white outline-none text-center"
                                    min={18} max={99}
                                    value={ageMin}
                                    onChange={e => setAgeMin(Number(e.target.value))}
                                />
                                <span className="text-white/40">to</span>
                                <input
                                    type="number"
                                    className="w-20 rounded-xl p-3 bg-white/20 text-white outline-none text-center"
                                    min={18} max={99}
                                    value={ageMax}
                                    onChange={e => setAgeMax(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('basic')}
                                className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 text-sm"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handlePreferences}
                                disabled={saving || interestedInGenders.length === 0}
                                className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-semibold disabled:opacity-40 transition-opacity"
                            >
                                {saving ? 'Saving...' : 'Continue →'}
                            </button>
                        </div>
                    </>
                )}

                {step === 'profile' && (
                    <>
                        <h1 className="text-xl font-bold text-white">Set up your profile</h1>

                        <div>
                            <p className="text-white/60 text-sm mb-1">Bio</p>
                            <textarea
                                className="w-full rounded-xl p-3 bg-white/20 text-white placeholder-white/40 outline-none resize-none"
                                placeholder="Tell people about yourself..."
                                rows={3}
                                maxLength={500}
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            />
                            <p className="text-white/30 text-xs text-right">{bio.length}/500</p>
                        </div>

                        <div>
                            <p className="text-white/60 text-sm mb-1">Dating intention</p>
                            <select
                                className="w-full rounded-xl p-3 bg-white/20 text-white outline-none"
                                value={datingIntentions}
                                onChange={e => setDatingIntentions(e.target.value)}
                            >
                                <option value="" disabled>What are you looking for?</option>
                                {DATING_INTENTION_OPTIONS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <p className="text-white/60 text-sm">Prompts (up to 3)</p>
                                {prompts.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setPrompts(p => [...p, { question: PROMPT_LIST[0], answer: '' }])}
                                        className="text-pink-400 text-sm"
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>

                            {prompts.map((prompt, i) => (
                                <div key={i} className="flex flex-col gap-1 bg-white/5 rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                        <select
                                            className="flex-1 bg-transparent text-white/80 text-sm outline-none"
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
                                            className="text-white/30 text-sm ml-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <input
                                        className="bg-transparent text-white text-sm outline-none placeholder-white/30 border-t border-white/10 pt-2 mt-1"
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

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('preferences')}
                                className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 text-sm"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleProfile}
                                disabled={saving || !bio || !datingIntentions}
                                className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-semibold disabled:opacity-40 transition-opacity"
                            >
                                {saving ? 'Saving...' : "Let's go! 🎉"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}