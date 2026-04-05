import client from './client'
import type {
    AuthResponse,
    RegisterResponse,
    MessageResponse,
    FullUser,
    Post,
    InteractionResponse,
    Match,
    Conversation,
    Message
} from '../types';

export const api = {
    auth: {
        register: (data: { email: string; password: string }) =>
            client.post<RegisterResponse>('/auth/register', data).then(r => r.data),
        verify: (data: { email: string, verificationCode: string }) =>
            client.post<AuthResponse>('/auth/verify', data).then(r => r.data),
        resendVerification: (email: string) =>
            client.post<MessageResponse>('/auth/resend-verification', { email }).then(r => r.data),

        login: (data: { email: string; password: string }) =>
            client.post<AuthResponse>('/auth/login', data).then(r => r.data),

        completeProfile: (data: {
            firstName: string
            lastName: string
            age: number
            gender: string
            major: string
            classYear: string
        }) => client.patch<MessageResponse>('/auth/complete-profile', data).then(r => r.data),

        forgotPassword: (email: string) =>
            client.post<MessageResponse>('/auth/forgot-password', { email }).then(r => r.data),
        resetPassword: (data: { token: string; newPassword: string }) =>
            client.post<MessageResponse>('/auth/reset-password', data).then(r => r.data),
    },
    users: {
        getMe: () =>
            client.get<{ user: FullUser }>('/users/me').then(r => r.data.user),
        updateMe: (data: Partial<{
            bio: string
            age: number
            major: string
            year: string
        }>) => client.put<{ user: FullUser }>('/users/me', data).then(r => r.data.user),
        discover: () =>
            client.get<{ users: FullUser[] }>('/users/discover').then(r => r.data.users),
    },
    interactions: {
        interact: (toUserId: string, type: 'like' | 'pass') =>
            client.post<InteractionResponse>('/interactions', { toUserId, type }).then(r => r.data),
    },
    matches: {
        getAll: () =>
            client.get<{ matches: Match[] }>('/matches').then(r => r.data.matches),
    },
    messages: {
        getConversations: () =>
            client.get<{ conversations: Conversation[] }>('/messages/conversations').then(r => r.data.conversations),
        getMessages: (conversationId: string) =>
            client.get<{ conversation: Conversation; messages: Message[] }>(`/messages/${conversationId}`).then(r => r.data),
        send: (toUserId: string, text: string) =>
            client.post<{ message: Message }>('/messages/send-msg', { toUserId, text }).then(r => r.data.message),
    },
    posts: {
        getAll: () =>
            client.get<Post[]>('/posts').then(r => r.data),
        getById: (id: string) =>
            client.get<Post>(`/posts/${id}`).then(r => r.data),
        create: (data: { title: string; body: string }) =>
            client.post<Post>('/posts', data).then(r => r.data),
        addComment: (postId: string, body: string) =>
            client.post<Post>(`/posts/${postId}/comments`, { body }).then(r => r.data),
        delete: (id: string) =>
            client.delete(`/posts/${id}`).then(r => r.data),
    }
}