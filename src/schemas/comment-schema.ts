import mongoose from 'mongoose';
import { DBCommentType } from '../types/DBCommentType';

export const CommentSchema = new mongoose.Schema<DBCommentType>({
    id: { type: String, require: true },
    postId: String,
    content: { type: String, require: true },
    commentatorInfo: {
        required: true,
        type: {
            userId: { type: String, require: true },
            userLogin: { type: String, require: true }
        }
    },

    likesInfo: {
        required: true,
        type: {
            likes: {
                require: true,
                type: [{
                    addedAt: { type: String, require: true },
                    userId: { type: String, require: true },
                    login: { type: String, require: true }
                }]
            },

            dislikes: {
                require: true,
                type: [{
                    addedAt: { type: String, require: true },
                    userId: { type: String, require: true },
                    login: { type: String, require: true }
                }]
            }
        }
    },

    createdAt: {
        type: String,
        default() {
            return new Date().toISOString();
        }
    }
});
