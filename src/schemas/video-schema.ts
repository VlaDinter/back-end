import mongoose from 'mongoose';
import { DBVideoType } from '../types/DBVideoType';

export const VideoSchema = new mongoose.Schema<DBVideoType>({
    id: Number,
    title: { type: String, require: true },
    author: { type: String, require: true },
    canBeDownloaded: { type: Boolean, default: false },
    minAgeRestriction: { type: Number, default: null },
    createdAt: {
        type: String,
        default() {
            return new Date().toISOString();
        }
    },

    publicationDate: {
        type: String,
        default() {
            const date = new Date();

            return new Date(date.setDate(date.getDate() + 1)).toISOString();
        }
    },

    availableResolutions: {
        type: [String],
        default() {
            return null;
        }
    },
});
