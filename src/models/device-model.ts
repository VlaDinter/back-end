import mongoose from 'mongoose';
import { DeviceSchema } from '../schemas/device-schema';

export const DeviceModel = mongoose.model('devices', DeviceSchema);
