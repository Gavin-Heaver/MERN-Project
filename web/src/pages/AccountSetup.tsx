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
            console.log(payload) // replace with your api call
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className='text-white p-4'>Account Setup</h1>
            <p>Complete your account setup to get started!</p>

            <form onSubmit={handleSubmit}>

                {/* Name */}
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
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
                />

                {/* Gender */}
                <select
                    value={genderIdentity}
                    onChange={e => setGenderIdentity(e.target.value)}
                >
                    {GENDER_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                {/* Custom gender field — only shown when "Other" is selected */}
                {genderIdentity === "Other" && (
                    <input
                        type="text"
                        placeholder="Describe your gender identity"
                        value={genderCustom}
                        onChange={e => setGenderCustom(e.target.value)}
                    />
                )}

                {/* Major */}
                <select
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    required
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
                >
                    <option value="" disabled>Select your class year</option>
                    {CLASS_YEAR_OPTIONS.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                </button>

            </form>
        </div>
    )
}