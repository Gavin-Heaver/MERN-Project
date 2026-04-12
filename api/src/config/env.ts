const required = [
    'MONGO_URI',
    'RESEND_API_KEY',
    'JWT_SECRET',
    'CLIENT_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
] as const

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
}

export const config = {
    mongoUri: process.env.MONGO_URI as string,
    resendKey: process.env.RESEND_API_KEY as string,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        apiSecret: process.env.CLOUDINARY_API_SECRET as string
    },
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: 60 * 60 * 24 * 7,
    clientUrl: process.env.CLIENT_URL as string,
    port: Number(process.env.PORT) || 3001
}