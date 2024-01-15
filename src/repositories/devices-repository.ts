import { devicesCollection } from '../db/db';
import { DBDeviceModel } from '../models/DBDeviceModel';

export const devicesLocalRepository = {
    async findDevices(userId: string): Promise<DBDeviceModel[]> {
        return await devicesCollection.find({ userId: userId }).toArray();
    },

    async findDevice(id: string): Promise<DBDeviceModel | null> {
        return await devicesCollection.findOne({ deviceId: id });
    },

    async createDevice(newDevice: DBDeviceModel): Promise<DBDeviceModel> {
        const result = await devicesCollection.insertOne(newDevice);

        return newDevice;
    },

    async updateDevice(deviceId: string, ip: string, lastActiveDate: string): Promise<DBDeviceModel | null> {
        return await devicesCollection.findOneAndUpdate(
            { deviceId },
            { $set: { ip, lastActiveDate } },
            { returnDocument: 'after' }
        );
    },

    async removeDevice(id: string): Promise<DBDeviceModel | null> {
        return await devicesCollection.findOneAndDelete({ deviceId: id });
    },

    async removeDevices(userId: string, id: string): Promise<void> {
        await devicesCollection.deleteMany({ $and: [{ userId: userId }, { deviceId: { $ne: id } }] });
    },

    async removeAll(): Promise<void> {
        await devicesCollection.deleteMany({});
    }
};
