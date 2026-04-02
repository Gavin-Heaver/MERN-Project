import mongoose, { InferSchemaType, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

interface IUserMethods {
    comparePassword(candidate: string): Promise<boolean>
}

const photoSchema = new mongoose.Schema(
    {
        url:
        {
            type: String,
            required: true,
            trim: true
        },
        isPrimary:
        {
            type: Boolean,
            default: false
        },
        order:
        {
            type: Number,
            default: 0
        }
    },
    { _id: true }
)

const promptAnswerSchema = new mongoose.Schema(
    {
        question:
        {
            type: String,
            required: true,
            trim: true
        },
        answer:
        {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: true }
)

const userSchema = new mongoose.Schema(
    {
        email:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.edu$/, "Only .edu email addresses are allowed"]
        },
        password:
        {
            type: String,
            required: true,
            select: false
        },
        accountStatus:
        {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active"
        },
        verification:
        {
            verificationCode:
            {
                type: String,
                required: true,
                // Ensures exactly 6 digits, allowing leading zeros
                match: [/^\d{6}$/, "Verification code must be exactly 6 digits"],
                default: "000000"
            },
            emailVerified:
            {
                type: Boolean,
                default: false
            },
            eduVerified:
            {
                type: Boolean,
                default: false
            },
            verifiedAt:
            {
                type: Date,
                default: null
            }
        },
        basicInfo:
        {
            firstName:  
            {
                type: String,
                trim: true
            },
            lastName:
            {
                type: String,
                trim: true
            },
            age:
            {
                type: Number,
                min: 18,
                max: 99
            },
            gender:
            {
                type: String,
                default: ""
            },
            major:
            {
                type: String,
                default: ""
            },
            classYear:
            {
                type: String,
                default: ""
            }
        },
        profile:
        {
            bio:
            {
                type: String,
                maxlength: 500,
                default: ""
            },
            photos:
            {
                type: [photoSchema],
                default: []
            },
            promptAnswers:
            {
                type: [promptAnswerSchema],
                default: []
            },
            interestTagIds:
            {
                type: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag"
                }],
                default: []
            }
        },

        preferences:
        {
            ageMin:
            {
                type: Number,
                min: 18,
                max: 99,
                default: 18
            },
            ageMax:
            {
                type: Number,
                min: 18,
                max: 99,
                default: 99
            },
            interestedIn:
            {
                type: [{
                    type: String,
                    default: ""
                }],
                default: []
            },
            dealbreakerTagIds:
            {
                type: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag"
                }],
                default: []
            }
        },

        settings:
        {
            notificationsEnabled:
            {
                type: Boolean,
                default: true
            },
            profileVisible:
            {
                type: Boolean,
                default: true
            }
        },
        bio:
        {
            type: String,
            default: '',
            trim: true,
            maxLength: 500
        },
        age:
        {
            type: Number,
            min: 18,
            max: 100
        },
        major:
        {
            type: String,
            default: '',
            trim: true
        },
        year:
        {
            type: String,
            default: '',
            trim: true
        }
    },
    { timestamps: true }
)

userSchema.pre("validate", function() {
    if (
        this.basicInfo?.gender?.identity === "Other" &&
        !this.basicInfo.gender.custom.trim()
    ) {
        throw new Error("Custom gender is required when gender identity is 'Other'.")
    }

    if (
        this.basicInfo?.gender?.identity &&
        this.basicInfo.gender.identity !== "Other"
    ) {
        this.basicInfo.gender.custom = "";
    }

    if (
        this.preferences?.ageMin !== undefined &&
        this.preferences?.ageMax !== undefined &&
        this.preferences.ageMin > this.preferences.ageMax
    ) {
        throw new Error("preferences.ageMin cannot be greater than preferences.ageMax.")
    }
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password)
}

type UserModel = Model<InferSchemaType<typeof userSchema>, {}, IUserMethods>;

export type UserType = InferSchemaType<typeof userSchema>
export const User = mongoose.model<InferSchemaType<typeof userSchema>, UserModel>('User', userSchema)