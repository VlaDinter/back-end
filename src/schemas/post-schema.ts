import mongoose from 'mongoose';
import { DBPostType } from '../types/DBPostType';

export const PostSchema = new mongoose.Schema<DBPostType>({
    id: { type: String, require: true },
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
    extendedLikesInfo: {
        required: true,
        type: {
            likes: {
                type: [{
                    addedAt: { type: String, require: true },
                    userId: { type: String, require: true },
                    login: { type: String, require: true }
                }],

                require: true
            },

            dislikes: {
                type: [{
                    addedAt: { type: String, require: true },
                    userId: { type: String, require: true },
                    login: { type: String, require: true }
                }],

                require: true
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
