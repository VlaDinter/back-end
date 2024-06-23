import add from 'date-fns/add';
import { DBDeviceType } from '../types/DBDeviceType';
import { DeviceType } from '../types/DeviceType';
import { DevicesRepository } from '../repositories/devices-repository';
import { inject, injectable } from 'inversify';

@injectable()
export class DevicesService {
    constructor(
        @inject(DevicesRepository) protected devicesRepository: DevicesRepository
    ) {}

    _mapDBDeviceToDeviceOutputModel(dbDevice: DBDeviceType): DeviceType {
        return {
            ip: dbDevice.ip,
            title: dbDevice.title,
            lastActiveDate: dbDevice.lastActiveDate,
            deviceId: dbDevice.deviceId
        };
    }

    _mapDBDeviceToDBDeviceModel(dbDevice: DBDeviceType): DBDeviceType {
        return {
            ip: dbDevice.ip,
            title: dbDevice.title,
            lastActiveDate: dbDevice.lastActiveDate,
            deviceId: dbDevice.deviceId,
            userId: dbDevice.userId,
            expirationDate: dbDevice.expirationDate
        };
    }

    async getDevices(userId: string): Promise<DeviceType[]> {
        const result = await this.devicesRepository.findDevices(userId);

        return result.map(this._mapDBDeviceToDeviceOutputModel);
    }

    async getDevice(id: string): Promise<DBDeviceType | null> {
        const result = await this.devicesRepository.findDevice(id);

        return result && this._mapDBDeviceToDBDeviceModel(result);
    }

    async addDevice(userId: string, ip: string, title: string): Promise<DeviceType> {
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

        const result = await this.devicesRepository.createDevice(device);

        return this._mapDBDeviceToDeviceOutputModel(result);
    }

    async editDevice(id: string, ip: string): Promise<DeviceType | null> {
        const lastActiveDate = new Date().toISOString();
        const result = await this.devicesRepository.updateDevice(id, ip, lastActiveDate);

        return result && this._mapDBDeviceToDeviceOutputModel(result);
    }

    async removeDevice(id: string): Promise<DeviceType | null> {
        const result = await this.devicesRepository.deleteDevice(id);

        return result && this._mapDBDeviceToDeviceOutputModel(result);
    }

    async removeDevices(userId: string, id: string): Promise<void> {
        await this.devicesRepository.deleteDevices(userId, id);
    }

    async removeAll(): Promise<void> {
        await this.devicesRepository.deleteAll();
    }
}
