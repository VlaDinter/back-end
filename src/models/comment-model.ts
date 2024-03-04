import mongoose from 'mongoose';
import { CommentSchema } from '../schemas/comment-schema';

export const CommentModel = mongoose.model('comments', CommentSchema);
