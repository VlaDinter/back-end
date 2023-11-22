import express from 'express';
import { getAppRouter } from './settings';
import bodyParser from 'body-parser';
import { routerPaths } from './utils';
import { videosRouter } from './routes/videos-router';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';

export const app = express();

app.use(bodyParser({}));
app.use(routerPaths.auth, authRouter);
app.use(routerPaths.videos, videosRouter);
app.use(routerPaths.blogs, blogsRouter);
app.use(routerPaths.posts, postsRouter);
app.use(routerPaths.users, usersRouter);
getAppRouter(app);
