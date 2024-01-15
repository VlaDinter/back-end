import { app } from './app';
import { Server } from 'http';
import { runDb } from './db/db';

const port = process.env.PORT || 3999;
const startApp = async () => {
    await runDb();

    app.set('trust proxy', true);

    const server: Server = app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

startApp();
