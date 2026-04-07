// Shared
export interface BasicInfo {
    basicInfoComplete: boolean
    firstName?: string
    lastName?: string
    age?: number
    gender?: string
    major?: string
    classYear?: string
}

export interface Verification {
    emailVerified: boolean
    verifiedAt: string | null
}

export interface Photo {
    _id: string
    url: string
    isPrimary: boolean
    order: number
}

export interface PromptAnswer {
    _id: string
    question: string
    answer: string
}

export interface Profile {
    bio: string
    photos: Photo[]
    promptAnswers: PromptAnswer[]
    interestTagIds: string[]
}

export interface Preferences {
    ageMin: number
    ageMax: number
    interestedInGenders: string[]
    preferredInterestTagIds: string[]
    dealbreakerTagIds: string[]
}

export interface Settings {
    notificationsEnabled: boolean
    profileVisible: boolean
}

// User

export interface User {
    id: string
    email: string
    basicInfo?: {
        basicInfoComplete: boolean
        firstName?: string
    }
}

export interface FullUser {
    _id: string
    email: string
    accountStatus: string
    basicInfo: BasicInfo
    verification: Verification
    profile: Profile
    preferences: Preferences
    settings: Settings
    createdAt: string
    updatedAt: string
}

export interface PopulatedMatchUser {
    _id: string
    email: string
    basicInfo?: BasicInfo
}

export interface ProfileData {
    firstName: string
    lastName: string
    age: number
    photos: string[]
    prompts: { question: string; answer: string }[]
    identity: {
        gender: string
        interestedIn: string[]
    }
    vitals: {
        height: number
        ethnicity: string
        major: string
        classYear: string
    }
    lifestyle: {
        religion: string
        politics: string
        datingIntention: string
        hometown: string
        work: string
    }
}

// Auth
export interface AuthResponse {
    token: string
    user: User
}

export interface RegisterResponse {
    message: string
}

export interface MessageResponse {
    message: string
}

// Posts
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

// Interactions
export interface Interaction {
    _id: string
    fromUserId: string
    toUserId: string
    type: 'like' | 'pass'
    createdAt: string
}

export interface InteractionResponse {
    interaction: Interaction
    matched: boolean
    match?: Match
}

// Matches

export interface Match {
    _id: string
    userAId: PopulatedMatchUser
    userBId: PopulatedMatchUser
    status: 'active' | 'unmatched' | 'blocked'
    conversationId: Conversation | string | null
    lastActivityAt: string
    createdAt: string
}

// Chats & Messages
export interface Conversation {
    _id: string
    matchId: string
    participantIds: string[]
    lastMessageAt: string | null
    lastMessagePreview: string
    status: 'active' | 'hidden' | 'closed'
    createdAt: string
}

export interface ReadBy {
    userId: string
    readAt: string
}

export interface Message {
    _id: string
    conversationId: string
    senderId: string
    messageType: 'text' | 'system'
    text: string
    status: 'sent' | 'read' | 'deleted'
    readBy: ReadBy[]
    createdAt: string
}