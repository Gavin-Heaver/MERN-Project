import { useState } from "react"
import { GENDER_OPTIONS, MAJOR_LIST, CLASS_YEAR_OPTIONS } from "../constants/profileOptions"

export default function AccountSetup() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState("")
    const [genderIdentity, setGenderIdentity] = useState("Unspecified")
    const [genderCustom, setGenderCustom] = useState("")
    const [major, setMajor] = useState("")
    const [classYear, setClassYear] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                basicInfo: {
                    firstName,
                    lastName,
                    age: Number(age),
                    gender: {
                        identity: genderIdentity,
                        custom: genderIdentity === "Other" ? genderCustom : ""
                    },
                    major,
                    classYear
                }
            }
            console.log(payload)
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full px-4 py-3 rounded-full bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
    const selectCls = "w-full px-4 py-3 rounded-full bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-sm [&>option]:text-black [&>option]:bg-white"

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center">

            {/* Background triangles */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="0,0 400,0 0,400" className="fill-brand-500/30" />
                <polygon points="1000,1000 1000,400 800,1000" className="fill-brand-500/30" />
            </svg>

            {/* Content */}
            <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center gap-6">

                {/* Logo */}
                <img
                    src="/logo_stars.webp"
                    alt="UKnighted Logo"
                    className="w-24 h-24 object-contain"
                />

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-500 tracking-wide">
                        Account Setup
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Complete your profile to get started!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">

                    {/* Name */}
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                        className={inputCls}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                        className={inputCls}
                    />

                    {/* Age */}
                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min={18}
                        max={99}
                        required
                        className={inputCls}
                    />

                    {/* Gender */}
                    <select
                        value={genderIdentity}
                        onChange={e => setGenderIdentity(e.target.value)}
                        className={selectCls}
                    >
                        {GENDER_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    {/* Custom gender */}
                    {genderIdentity === "Other" && (
                        <input
                            type="text"
                            placeholder="Describe your gender identity"
                            value={genderCustom}
                            onChange={e => setGenderCustom(e.target.value)}
                            className={inputCls}
                        />
                    )}

                    {/* Major */}
                    <select
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        required
                        className={selectCls}
                    >
                        <option value="" disabled>Select your major</option>
                        {MAJOR_LIST.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    {/* Class Year */}
                    <select
                        value={classYear}
                        onChange={e => setClassYear(e.target.value)}
                        required
                        className={selectCls}
                    >
                        <option value="" disabled>Select your class year</option>
                        {CLASS_YEAR_OPTIONS.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
                    >
                        {loading ? 'Saving...' : 'Continue'}
                    </button>

                </form>
            </div>
        </div>
    )
}