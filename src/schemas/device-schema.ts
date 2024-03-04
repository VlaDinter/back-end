import mongoose from 'mongoose';
import { DBDeviceType } from '../types/DBDeviceType';

export const DeviceSchema = new mongoose.Schema<DBDeviceType>({
    ip: { type: String, require: true },
    title: { type: String, require: true },
    lastActiveDate: { type: String, require: true },
    deviceId: { type: String, require: true },
    userId: { type: String, require: true },
    expirationDate: { type: Date, require: true }
});
