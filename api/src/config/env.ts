const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLIENT_URL'
] as const

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
}

export const config = {
    mongoUri: process.env.MONGO_URI as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: 60 * 60 * 24 * 7,
    clientUrl: process.env.CLIENT_URL as string,
    port: Number(process.env.PORT) || 3001
}