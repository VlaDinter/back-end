import mongoose from 'mongoose';
import { VideoSchema } from '../schemas/video-schema';

export const VideoModel = mongoose.model('videos', VideoSchema);
