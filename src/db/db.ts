import { MongoClient } from 'mongodb';
import { settings } from '../settings';
import { DBBlogModel } from '../models/DBBlogModel';
import { DBPostModel } from '../models/DBPostModel';
import { DBVideoModel } from '../models/DBVideoModel';
import { DBUserModel } from '../models/DBUserModel';
import { DBCommentModel } from '../models/DBCommentModel';

const mongoURI = settings.MONGO_URI;
const client = new MongoClient(mongoURI);
const db = client.db();

export const videosCollection = db.collection<DBVideoModel>('videos');
export const blogsCollection = db.collection<DBBlogModel>('blogs');
export const postsCollection = db.collection<DBPostModel>('posts');
export const usersCollection = db.collection<DBUserModel>('users');
export const commentsCollection = db.collection<DBCommentModel>('comments');

export async function runDb() {
    try {
        await client.connect();
        console.log("Connected successfully to mongo server");
    } catch {
        console.log("Can't connect to db");
        await client.close();
    }
}
