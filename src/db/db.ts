import mongoose from 'mongoose';
import { settings } from '../settings';

const mongoURI = settings.MONGO_URI;
const mongoDBName = process.env.MONGO_DB_NAME;

export async function runDb() {
    try {
        await mongoose.connect(mongoURI, {
            dbName: mongoDBName,
        });

        console.log('Connected successfully to mongo server');
    } catch {
        console.log('Can\'t connect to db');

        await mongoose.disconnect()
    }
}
