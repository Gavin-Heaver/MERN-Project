import mongoose from 'mongoose'
import { config } from './env'

export async function connectMongo(): Promise<void> {
    await mongoose.connect(config.mongoUri, {
        serverApi: { version: '1', strict: true, deprecationErrors: true }
    })
    console.log('MongoDB connected')
}