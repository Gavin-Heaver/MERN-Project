export interface User {
    id: string
    email: string
    displayName: string
}

export interface Comment {
    _id: string
    author: Pick<User, 'id' | 'displayName'>
    body: string
    createdAt: string
}

export interface Post {
    _id: string
    author: Pick<User, 'id' | 'displayName' | 'email'>
    title: string
    body: string
    comments: Comment[]
    createdAt: string
}

export interface AuthResponse {
    token: string
    user: User
}