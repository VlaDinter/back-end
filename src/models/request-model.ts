import mongoose from 'mongoose';
import { RequestSchema } from '../schemas/request-schema';

export const RequestModel = mongoose.model('requests', RequestSchema);
