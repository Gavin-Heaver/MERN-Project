import { MessageCircle, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
    const { pathname } = useLocation()

    const links = [
        { to: '/people', label: 'People', icon: Users },
        { to: '/chats', label: 'Messages', icon: MessageCircle },
        { to: '/account', label: 'Account', icon: User }
    ]

    return (
        <header className="fixed bottom-0 left-0 right-0 bg-neutral-900 backdrop-blur-sm border-t border-border z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
            <nav className="flex justify-around items-center h-16 max-w-screen-sm mx-auto">
                {links.map(({ to, label, icon: Icon }) => {
                    const active = pathname.startsWith(to)
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                                active
                                    ? 'text-brand-300'
                                    : 'text-muted hover:text-foreground'
                            }`}
                        >
                            <Icon className="w-6 h-6" />
                            {label}
                        </Link>
                    )
                })}
            </nav>
        </header>
    )
}