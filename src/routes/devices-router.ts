import { Router, Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { refreshTokenMiddleware } from '../middlewares/refresh-token-middleware';
import { devicesService } from '../domain/devices-service';

export const devicesRouter = Router({});

devicesRouter.get('/', refreshTokenMiddleware, async (req: Request, res: Response) => {
    const foundDevices = await devicesService.getDevices(req.userId!);

    res.send(foundDevices);
});

devicesRouter.delete('/', refreshTokenMiddleware, async (req: Request, res: Response) => {
    await devicesService.deleteDevices(req.userId!, req.deviceId!);

    res.send(CodeResponsesEnum.Not_content_204);
});

devicesRouter.delete('/:deviceId', refreshTokenMiddleware, async (req: Request, res: Response) => {
    const device = await devicesService.getDevice(req.params.deviceId);

    if (!device) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else if (req.userId !== device.userId) {
        res.send(CodeResponsesEnum.Forbidden_403);
    } else {
        await devicesService.deleteDevice(req.params.deviceId);

        res.send(CodeResponsesEnum.Not_content_204);
    }
});
