import { useState } from "react"

const MAJOR_LIST = [
    "Accounting",
    "Actuarial Science",
    "Advertising/Public Relations",
    "Aerospace Engineering",
    "Anthropology",
    "Architecture",
    "Art",
    "Biology",
    "Biomedical Sciences",
    "Biotechnology",
    "Business Economics",
    "Career and Technical Education",
    "Chemistry",
    "Civil Engineering",
    "Communication",
    "Communication and Conflict",
    "Communication Sciences and Disorders",
    "Computer Engineering",
    "Computer Science",
    "Construction Engineering",
    "Criminal Justice",
    "Data Science",
    "Digital Media",
    "Early Childhood Development and Education",
    "Economics",
    "Electrical Engineering",
    "Elementary Education",
    "Emergency Management",
    "Emerging Media",
    "English",
    "Entertainment Management",
    "Environmental Engineering",
    "Environmental Science",
    "Environmental Studies",
    "Event Management",
    "Exceptional Student Education",
    "Film",
    "Finance",
    "Forensic Science",
    "French and Francophone Studies",
    "General Health Studies",
    "Health Informatics",
    "Health Informatics and Information Management",
    "Health Sciences",
    "History",
    "Hospitality Management",
    "Industrial Engineering",
    "Information Technology",
    "Integrative General Studies",
    "Interdisciplinary Studies",
    "International and Global Studies",
    "Journalism",
    "Latin American, Caribbean and Latinx Studies",
    "Legal Studies",
    "Lifestyle Community Management",
    "Lodging and Restaurant Management",
    "Management",
    "Marketing",
    "Materials Science and Engineering",
    "Mathematics",
    "Mechanical Engineering",
    "Medical Laboratory Sciences",
    "Molecular and Cellular Biology",
    "Molecular Microbiology",
    "Music",
    "Nonprofit Management",
    "Nursing",
    "Philosophy",
    "Photonic Science and Engineering",
    "Physics",
    "Political Science",
    "Psychology",
    "Public Administration",
    "Real Estate",
    "Religion and Cultural Studies",
    "Risk Management and Insurance",
    "Secondary Education",
    "Social Sciences",
    "Social Work",
    "Sociology",
    "Spanish",
    "Statistics",
    "Theatre",
    "Theatre Studies",
    "Writing and Rhetoric"
] as const

const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Other", "Unspecified"] as const

const CLASS_YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"] as const

export default function AccountSetup() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState("")
    const [genderIdentity, setGenderIdentity] = useState("Unspecified")
    const [genderCustom, setGenderCustom] = useState("")
    const [major, setMajor] = useState("")
    const [classYear, setClassYear] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
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