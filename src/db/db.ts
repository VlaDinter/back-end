import { MongoClient } from 'mongodb';
import { settings } from '../settings';
import { DBBlogModel } from '../models/DBBlogModel';
import { DBPostModel } from '../models/DBPostModel';
import { DBVideoModel } from '../models/DBVideoModel';
import { DBUserModel } from '../models/DBUserModel';
import { DBCommentModel } from '../models/DBCommentModel';
import { DBDeviceModel } from '../models/DBDeviceModel';
import { DBRequestModel } from '../models/DBRequestModel';

const mongoURI = settings.MONGO_URI;
const client = new MongoClient(mongoURI);
const db = client.db();

export const videosCollection = db.collection<DBVideoModel>('videos');
export const blogsCollection = db.collection<DBBlogModel>('blogs');
export const postsCollection = db.collection<DBPostModel>('posts');
export const usersCollection = db.collection<DBUserModel>('users');
export const commentsCollection = db.collection<DBCommentModel>('comments');
export const devicesCollection = db.collection<DBDeviceModel>('devices');
export const requestsCollection = db.collection<DBRequestModel>('requests');

export async function runDb() {
    try {
        await client.connect();
        console.log("Connected successfully to mongo server");
    } catch {
        console.log("Can't connect to db");
        await client.close();
    }
}
