import 'reflect-metadata';
import { app } from './app';
import { runDb } from './db/db';
import { settings } from './settings';

const port = settings.PORT;
const startApp = async () => {
    await runDb();

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

startApp();
