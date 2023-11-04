import { videosCollection } from '../db/db';
import { VideoModel } from '../models/VideoModel';
import { DBVideoModel } from '../models/DBVideoModel';

export const videosLocalRepository = {
    async findVideos(): Promise<DBVideoModel[]> {
        return await videosCollection.find({}).toArray();
    },

    async findVideo(id: number): Promise<DBVideoModel | null> {
        return await videosCollection.findOne({ id });
    },

    async createVideo(newVideo: DBVideoModel): Promise<DBVideoModel> {
        const result = await videosCollection.insertOne(newVideo);

        return newVideo;
    },

    async updateVideo(id: number, newVideo: VideoModel): Promise<DBVideoModel | null> {
        return await videosCollection.findOneAndUpdate(
            { id },
            { $set: newVideo },
            { returnDocument: 'after' }
        );
    },

    async removeVideo(id: number): Promise<DBVideoModel | null> {
        return await videosCollection.findOneAndDelete({ id });
    },

    async removeAll(): Promise<void> {
        await videosCollection.deleteMany({});
    }
};
