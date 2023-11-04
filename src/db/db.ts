import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { DBBlogModel } from '../models/DBBlogModel';
import { DBPostModel } from '../models/DBPostModel';
import { DBVideoModel } from '../models/DBVideoModel';

dotenv.config();

const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';
const client = new MongoClient(mongoURI);
const db = client.db();

export const videosCollection = db.collection<DBVideoModel>('videos');
export const blogsCollection = db.collection<DBBlogModel>('blogs');
export const postsCollection = db.collection<DBPostModel>('posts');

export async function runDb() {
    try {
        await client.connect();
        console.log("Connected successfully to mongo server");
    } catch {
        console.log("Can't connect to db");
        await client.close();
    }
}
