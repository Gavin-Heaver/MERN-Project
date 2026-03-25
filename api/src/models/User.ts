import mongoose, { InferSchemaType, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

interface IUserMethods {
    comparePassword(candidate: string): Promise<boolean>
}

type UserModel = Model<InferSchemaType<typeof userSchema>, {}, IUserMethods>

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/\.edu$/, 'Only .edu email addresses are allowed']
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        displayName: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password)
}

export type UserType = InferSchemaType<typeof userSchema>
export const User = mongoose.model<InferSchemaType<typeof userSchema>, UserModel>('User', userSchema)