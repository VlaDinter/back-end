import { Router } from 'express';
import { refreshTokenMiddleware } from '../middlewares/refresh-token-middleware';
import { DevicesController } from '../controllers/devices-controller';
import { container } from '../features/composition-root';

const devicesController = container.resolve(DevicesController);

export const devicesRouter = Router({});

devicesRouter.get('/', refreshTokenMiddleware, devicesController.getDevices.bind(devicesController));
devicesRouter.delete('/', refreshTokenMiddleware, devicesController.deleteDevices.bind(devicesController));
devicesRouter.delete('/:deviceId', refreshTokenMiddleware, devicesController.deleteDevice.bind(devicesController));
