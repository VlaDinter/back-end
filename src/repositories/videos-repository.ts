import { videosCollection } from '../db/db';
import { VideoModel } from '../models/VideoModel';

export const videosLocalRepository = {
    async findVideos(): Promise<VideoModel[]> {
        return videosCollection.find({}).toArray();
    },

    async findVideo(id: number): Promise<VideoModel | null> {
        const video = await videosCollection.findOne({ id });

        if (!video) {
            return null;
        }

        return video;
    },

    async createVideo({ title, author, canBeDownloaded, minAgeRestriction, publicationDate, availableResolutions }: VideoModel): Promise<VideoModel> {
        const newVideo = {
            id: +(new Date()),
            title: title,
            author: author,
            canBeDownloaded: canBeDownloaded || false,
            minAgeRestriction: minAgeRestriction || null,
            createdAt: new Date().toISOString(),
            availableResolutions: availableResolutions || null,
            publicationDate: !publicationDate ?
                new Date((new Date()).setDate((new Date()).getDate() + 1)).toISOString() :
                new Date(publicationDate).toISOString()
        };

        const result = await videosCollection.insertOne(newVideo);

        return newVideo;
    },

    async updateVideo(id: number, newVideo: VideoModel): Promise<VideoModel | null> {
        const result = await videosCollection.updateOne({ id }, { $set: newVideo });
        const video = await this.findVideo(id);

        if (result.matchedCount === 1) {
            return video;
        }

        return null;
    },

    async removeVideo(id: number): Promise<VideoModel | null> {
        const video = await this.findVideo(id);
        const result = await videosCollection.deleteOne({ id });

        if (result.deletedCount === 1) {
            return video;
        }

        return null;
    },

    async deleteAll(): Promise<void> {
        await videosCollection.deleteMany({});
    }
};
