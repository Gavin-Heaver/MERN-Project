import client from './client'
import type {
    AuthResponse,
    RegisterResponse,
    MessageResponse,
    FullUser,
    Post,
    InteractionResponse,
    Match,
    PotentialMatch
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
        updateMe: (data: Partial<{ bio: string }>) =>
            client.put<{ user: FullUser }>('/users/me', data).then(r => r.data.user),
        updateAccountStatus: (accountStatus: 'active' | 'inactive') =>
            client.patch<{ message: string; accountStatus: string }>('/users/me/status', { accountStatus }),
        deleteAccount: () =>
            client.delete<MessageResponse>('/auth/delete-account'),
        discover: () =>
            client.get<{ users: PotentialMatch[] }>('/users/discover').then(r => r.data.users),
        getById: (id: string) =>
            client.get<{ user: FullUser }>(`/users/${id}`).then(r => r.data.user),
        updateBasicInfo: (data: {
            firstName: string; lastName: string; age: number
            gender: string; major: string; classYear: string
        }) => client.patch<MessageResponse>('/users/basic-info', data).then(r => r.data),
        updatePreferences: (data: {
            ageMin: number; ageMax: number
            interestedInGenders: string[]
            preferredInterestTagIds?: string[]
            dealbreakerTagIds?: string[]
        }) => client.patch<MessageResponse>('/users/preferences', data).then(r => r.data),
        updateProfile: (data: {
            bio: string
            photos: { url: string; publicId?: string }[]
            promptAnswers: { question: string; answer: string }[]
            interestTagIds: string[]
            datingIntentions: string
        }) => client.patch<MessageResponse>('/users/profile', data).then(r => r.data),
    },
    profile: {
        getProfile: () =>
            client.get<{ user: FullUser }>('/users/me').then(r => r.data.user),
        uploadPhoto: (formData: FormData) =>
            client.post<{ url: string; publicId: string }>('/users/me/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(r => r.data),
        deletePhoto: (photoId: string) =>
            client.delete<MessageResponse>(`/users/me/photos/${photoId}`).then(r => r.data),
        setPrimaryPhoto: (photoId: string) =>
            client.patch<MessageResponse>(`/users/me/photos/${photoId}/primary`).then(r => r.data)
    },
    interactions: {
        interact: (toUserId: string, type: 'like' | 'pass') =>
            client.post<InteractionResponse>('/interactions', { toUserId, type }).then(r => r.data),
        unmatch: (otherUserId: string) =>
            client.delete<MessageResponse>(`/interactions/unmatch/${otherUserId}`).then(r => r.data),
    },
    matches: {
        getAll: () =>
            client.get<{ matches: Match[] }>('/matches').then(r => r.data.matches),
    },
    messages: {
        getConversations: async () => {
            const { data } = await client.get('/messages/conversations')
            return data
        },
        getMessages: async (conversationId: string) =>{
            const { data } = await client.get(`/messages/${conversationId}`)
            return data
        },
        send: async (toUserId: string, text: string) => {
            const { data } = await client.post('/messages/send-msg', { toUserId, text })
            return data
        },
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