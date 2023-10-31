import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { VideoModel } from '../models/VideoModel';
import { BlogModel } from '../models/BlogModel';
import { PostModel } from '../models/PostModel';

dotenv.config();

const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';
const client = new MongoClient(mongoURI);
const db = client.db();

export const videosCollection = db.collection<VideoModel>('videos');
export const blogsCollection = db.collection<BlogModel>('blogs');
export const postsCollection = db.collection<PostModel>('posts');

export async function runDb() {
    try {
        await client.connect();
    } catch {
        await client.close();
    }
}
