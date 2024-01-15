import add from 'date-fns/add';
import { DBDeviceModel } from '../models/DBDeviceModel';
import { DeviceOutputModel } from '../models/DeviceOutputModel';
import { devicesLocalRepository } from '../repositories/devices-repository';

export const devicesService = {
    _mapDBDeviceToDeviceOutputModel(dbDevice: DBDeviceModel): DeviceOutputModel {
        return {
            ip: dbDevice.ip,
            title: dbDevice.title,
            lastActiveDate: dbDevice.lastActiveDate,
            deviceId: dbDevice.deviceId
        };
    },

    _mapDBDeviceToDBDeviceModel(dbDevice: DBDeviceModel): DBDeviceModel {
        return {
            ip: dbDevice.ip,
            title: dbDevice.title,
            lastActiveDate: dbDevice.lastActiveDate,
            deviceId: dbDevice.deviceId,
            userId: dbDevice.userId,
            expirationDate: dbDevice.expirationDate
        };
    },

    async getDevices(userId: string): Promise<DeviceOutputModel[]> {
        const result = await devicesLocalRepository.findDevices(userId);

        return result.map(this._mapDBDeviceToDeviceOutputModel);
    },

    async getDevice(id: string): Promise<DBDeviceModel | null> {
        const result = await devicesLocalRepository.findDevice(id);

        return result && this._mapDBDeviceToDBDeviceModel(result);
    },

    async setDevice(userId: string, ip: string, title: string): Promise<DeviceOutputModel> {
        const device = {
            userId,
            ip,
            title,
            lastActiveDate: new Date().toISOString(),
            deviceId: `${+(new Date())}`,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30
            })
        };

        const result = await devicesLocalRepository.createDevice(device);

        return this._mapDBDeviceToDeviceOutputModel(result);
    },

    async editDevice(id: string, ip: string): Promise<DeviceOutputModel | null> {
        const lastActiveDate = new Date().toISOString();
        const result = await devicesLocalRepository.updateDevice(id, ip, lastActiveDate);

        return result && this._mapDBDeviceToDeviceOutputModel(result);
    },

    async deleteDevice(id: string): Promise<DeviceOutputModel | null> {
        const result = await devicesLocalRepository.removeDevice(id);

        return result && this._mapDBDeviceToDeviceOutputModel(result);
    },

    async deleteDevices(userId: string, id: string): Promise<void> {
        await devicesLocalRepository.removeDevices(userId, id);
    },

    async deleteAll(): Promise<void> {
        await devicesLocalRepository.removeAll();
    }
};
