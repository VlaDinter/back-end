import mongoose from 'mongoose';
import { BlogSchema } from '../schemas/blog-schema';

export const BlogModel = mongoose.model('blogs', BlogSchema);
