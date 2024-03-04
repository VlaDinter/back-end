import mongoose from 'mongoose';
import { DBRequestType } from '../types/DBRequestType';

export const RequestSchema = new mongoose.Schema<DBRequestType>({
    ip: { type: String, require: true },
    url: { type: String, require: true },
    date: { type: Date, require: true }
});
