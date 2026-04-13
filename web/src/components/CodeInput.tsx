import { useRef, useState } from "react";

interface CodeInputProps {
    onChange: (value: string) => void
    disabled?: boolean
}

export default function CodeInput({ onChange, disabled }: CodeInputProps) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
    const inputs = useRef<(HTMLInputElement | null)[]>([])

    function update(next: string[]) {
        setDigits(next)
        onChange(next.join(''))
    }

    function handleChange(i: number, val: string) {
        const digit = val.replace(/\D/g, '').slice(-1)
        if (!digit) return
        const next = [...digits]
        next[i] = digit
        update(next)
        if (i < 5) inputs.current[i + 1]?.focus()
    }

    function handleKeyDown(i: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace') {
            e.preventDefault()
            const next = [...digits]
            if (next[i]) {
                next[i] = ''
                update(next)
            } else if (i > 0) {
                next[i - 1] = ''
                update(next)
                inputs.current[i - 1]?.focus()
            }
        }
        if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus()
        if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus()
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const next = Array(6).fill('')
        pasted.split('').forEach((c, i) => { next[i] = c })
        update(next)
        inputs.current[Math.min(pasted.length), 5]?.focus()
    }

    return (
        <div className="flex gap-3 justify-center">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className="caret-transparent w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-ucf/30 outline-none focus:border-ucf bg-white text-ucf transition-colors disabled:opacity-50"
                />
            ))}
        </div>
    )
}
