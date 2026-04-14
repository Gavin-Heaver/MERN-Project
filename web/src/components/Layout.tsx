import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()

    const protectedRoutes = ['/people', '/chats', '/chat', '/account']
    const showNavbar = protectedRoutes.some(route => location.pathname.startsWith(route))

    return (
        <>
            {showNavbar && <Navbar />}

            <main className={showNavbar ? 'pb-16 md:pt-16 md:pb-0' : ''}>
                {children}
            </main>
        </>
    )
}