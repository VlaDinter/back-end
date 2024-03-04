import mongoose from 'mongoose';
import { settings } from '../settings';

const mongoURI = settings.MONGO_URI;

export async function runDb() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected successfully to mongo server");
    } catch {
        console.log("Can't connect to db");
        await mongoose.disconnect()
    }
}
