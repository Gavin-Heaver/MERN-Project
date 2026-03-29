import mongoose, { InferSchemaType } from "mongoose";
declare const commentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    author: mongoose.Types.ObjectId;
    body: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    author: mongoose.Types.ObjectId;
    body: string;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    author: mongoose.Types.ObjectId;
    body: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    author: mongoose.Types.ObjectId;
    body: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
declare const postSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type PostType = InferSchemaType<typeof postSchema>;
export type CommentType = InferSchemaType<typeof commentSchema>;
export declare const Post: mongoose.Model<{
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
    } & mongoose.DefaultTimestampProps>;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    author: mongoose.Types.ObjectId;
    body: string;
    title: string;
    comments: mongoose.Types.DocumentArray<{
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, {}, {}> & {
        author: mongoose.Types.ObjectId;
        body: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export {};
//# sourceMappingURL=Post.d.ts.map