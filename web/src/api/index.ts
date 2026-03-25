import client from './client'
import type { Post, AuthResponse } from '../types';

export const api = {
    auth: {
        register: (data: { email: string; password: string; displayName: string }) =>
            client.post<AuthResponse>('/auth/register', data).then(r => r.data),
        login: (data: { email: string; password: string }) =>
            client.post<AuthResponse>('/auth/login', data).then(r => r.data)
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
    }
}