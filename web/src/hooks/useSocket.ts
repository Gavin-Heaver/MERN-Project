import { useEffect, useRef } from "react";
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

let socket: Socket | null = null

export function useSocket(): Socket | null {
    const { token, user } = useAuth()
    const connected = useRef(false)

    useEffect(() => {
        if (!token || !user || connected.current) return
        connected.current = true

        socket = io('/', { auth: { token } })
        socket.on('connect', () => socket!.emit('user:online', user.id))

        return () => {
            socket?.disconnect()
            socket = null
            connected.current = false
        }
    }, [token, user])

    return socket
}