import { app } from './app';
import { Server } from 'http';

const port = process.env.PORT || 3999;

const server: Server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
