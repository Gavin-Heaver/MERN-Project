import mongoose, { InferSchemaType, Model } from 'mongoose';
interface IUserMethods {
    comparePassword(candidate: string): Promise<boolean>;
}
declare const userSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    password: string;
    displayName: string;
    bio: string;
    major: string;
    year: string;
    age?: number | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    email: string;
    password: string;
    displayName: string;
    bio: string;
    major: string;
    year: string;
    age?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    email: string;
    password: string;
    displayName: string;
    bio: string;
    major: string;
    year: string;
    age?: number | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    email: string;
    password: string;
    displayName: string;
    bio: string;
    major: string;
    year: string;
    age?: number | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
type UserModel = Model<InferSchemaType<typeof userSchema>, {}, IUserMethods>;
export type UserType = InferSchemaType<typeof userSchema>;
export declare const User: UserModel;
export {};
//# sourceMappingURL=User.d.ts.map