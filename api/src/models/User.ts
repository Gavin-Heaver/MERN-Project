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
        displayName:
        {
            type: String,
            required: true,
            trim: true
        },
        passwordResetToken: {
            type: String,
            default: null
        },
        passwordResetExpires: {
            type: Date,
            default: null
        },
        accountStatus:
        {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active"
        },
        passwordResetToken:
        {
            type: String,
            default: null
        },
        passwordResetExpiry:
        {
            type: Date,
            default: null
        },
        verification:
        {
            code:
            {
                type: String,
                default: null,
                // ensures 6 digits exactly, any order of digits
                match: [/^\d{6}$/, "Verification code must be exactly 6 digits"]
            },
            codeCreatedAt:
            {
                type: Date,
                default: null
            },
            emailVerified:
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
            basicInfoComplete: 
            { 
                type: Boolean, 
                default: false 
            },
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
            interestedInGenders:
            {
                type: [{
                    type: String,
                    trim: true
                }],
                default: [],
                validate:
                {
                    validator: function(values: string[])
                    {
                        return values.every(value => typeof value === "string" && value.trim().length > 0)
                    },
                    message: "interestedInGenders cannot contain empty values."
                }
            },
            preferredInterestTagIds:
            {
                type: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag"
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
        }
    },
    { timestamps: true }
)

userSchema.pre("validate", function ()
{
    if (
        this.preferences?.ageMin !== undefined &&
        this.preferences?.ageMax !== undefined &&
        this.preferences.ageMin > this.preferences.ageMax
    )
    {
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