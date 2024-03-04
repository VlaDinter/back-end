import mongoose from 'mongoose';
import { DBBlogType } from '../types/DBBlogType';

export const BlogSchema = new mongoose.Schema<DBBlogType>({
    id: { type: String, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true },
    websiteUrl: { type: String, require: true },
    isMembership: { type: Boolean, default: false },
    createdAt: {
        type: String,
        default() {
            return new Date().toISOString();
        }
    }
});
