export interface User {
    id: string
    email: string
    displayName: string
}

export interface Comment {
    _id: string
    author: {
        _id: string
        displayName: string
        email: string
    }
    body: string
    createdAt: string
}

export interface Post {
    _id: string
    author: {
        _id: string
        displayName: string
        email: string
    }
    title: string
    body: string
    comments: Comment[]
    createdAt: string
}

export interface AuthResponse {
    token: string
    user: User
}