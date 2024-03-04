import { app } from './app';
import { Server } from 'http';
import { runDb } from './db/db';
import { settings } from './settings';

const port = settings.PORT;
const startApp = async () => {
    await runDb();

    const server: Server = app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

startApp();
