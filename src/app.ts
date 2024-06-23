import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { routerPaths } from './utils';
import { videosRouter } from './routes/videos-router';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { commentsRouter } from './routes/comments-router';
import { devicesRouter } from './routes/devices-router';
import { AppController } from './controllers/app-controller';
import { container } from './features/composition-root';

export const app = express();

const appController = container.resolve(AppController);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(routerPaths.auth, authRouter);
app.use(routerPaths.videos, videosRouter);
app.use(routerPaths.blogs, blogsRouter);
app.use(routerPaths.posts, postsRouter);
app.use(routerPaths.users, usersRouter);
app.use(routerPaths.comments, commentsRouter);
app.use(routerPaths.securityDevices, devicesRouter);
app.set('trust proxy', true);
app.get('/', appController.getHello.bind(appController));
app.delete('/testing/all-data', appController.deleteAllData.bind(appController));
