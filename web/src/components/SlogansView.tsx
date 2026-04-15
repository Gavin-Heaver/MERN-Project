import { useEffect, useState } from "react"

const SLOGANS = [
    "Find your knight in shining armor",
    "Where UCF hearts meet",
    "Your love story starts here",
    "Connect with Knights who get you",
    "Ready to look for love?"
]

export default function SlogansView() {
    const [sloganIndex, setSloganIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setSloganIndex((prev) => (prev + 1) % SLOGANS.length)
                setIsAnimating(false)
            }, 500)
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-16 mb-4 flex items-center justify-center overflow-hidden">
            <p
                className={`text-xl font-medium text-center bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400 bg-clip-text text-transparent animate-magical transition-all duration-500 ${
                    isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
                style={{
                    textShadow: '0 0 20px rgba(170, 57, 71, 0.3)'
                }}
            >
                {SLOGANS[sloganIndex]}
            </p>
        </div>
    )
}