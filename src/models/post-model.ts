import mongoose from 'mongoose';
import { PostSchema } from '../schemas/post-schema';

export const PostModel = mongoose.model('posts', PostSchema);
