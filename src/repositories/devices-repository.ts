import { DBDeviceType } from '../types/DBDeviceType';
import { DeviceModel } from '../models/device-model';
import { injectable } from 'inversify';

@injectable()
export class DevicesRepository {
    async findDevices(userId: string): Promise<DBDeviceType[]> {
        return DeviceModel.find({}, { _id: 0 }).where({ userId }).lean();
    }

    async findDevice(id: string): Promise<DBDeviceType | null> {
        return DeviceModel.findOne({ deviceId: id }, { _id: 0 }).lean();
    }

    async createDevice(newDevice: DBDeviceType): Promise<DBDeviceType> {
        const deviceInstance = new DeviceModel();

        deviceInstance.ip = newDevice.ip;
        deviceInstance.title = newDevice.title;
        deviceInstance.lastActiveDate = newDevice.lastActiveDate;
        deviceInstance.deviceId = newDevice.deviceId;
        deviceInstance.userId = newDevice.userId;
        deviceInstance.expirationDate = newDevice.expirationDate;

        await deviceInstance.save();

        return deviceInstance;
    }

    async updateDevice(deviceId: string, ip: string, lastActiveDate: string): Promise<DBDeviceType | null> {
        const deviceInstance = await DeviceModel.findOne({ deviceId });

        if (!deviceInstance) return null;

        deviceInstance.ip = ip;
        deviceInstance.lastActiveDate = lastActiveDate;

        const result = await deviceInstance.save();

        return result;
    }

    async deleteDevice(id: string): Promise<DBDeviceType | null> {
        const deviceInstance = await DeviceModel.findOne({ deviceId: id });

        if (!deviceInstance) return null;

        await deviceInstance.deleteOne();

        return deviceInstance;
    }

    async deleteDevices(userId: string, id: string): Promise<void> {
        await DeviceModel.deleteMany({ $and: [{ userId: userId }, { deviceId: { $ne: id } }] });
    }

    async deleteAll(): Promise<void> {
        await DeviceModel.deleteMany({});
    }
}
