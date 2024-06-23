import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { DevicesService } from '../domain/devices-service';

@injectable()
export class DevicesController {
    constructor(
        @inject(DevicesService) protected devicesService: DevicesService
    ) {}

    async getDevices(req: Request, res: Response) {
        const foundDevices = await this.devicesService.getDevices(req.userId!);

        res.send(foundDevices);
    }

    async deleteDevices(req: Request, res: Response) {
        await this.devicesService.removeDevices(req.userId!, req.deviceId!);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async deleteDevice(req: Request, res: Response) {
        const device = await this.devicesService.getDevice(req.params.deviceId);

        if (!device) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else if (req.userId !== device.userId) {
            res.send(CodeResponsesEnum.Forbidden_403);
        } else {
            await this.devicesService.removeDevice(req.params.deviceId);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
}
