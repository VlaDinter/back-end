import { videosCollection } from '../db/db';
import { VideoModel } from '../models/VideoModel';

export const videosLocalRepository = {
    async findVideos(): Promise<VideoModel[]> {
        const videos = await videosCollection.find({}).toArray();

        return videos.map(video => ({
            id: video.id,
            title: video.title,
            author: video.author,
            canBeDownloaded: video.canBeDownloaded,
            minAgeRestriction: video.minAgeRestriction,
            createdAt: video.createdAt,
            availableResolutions: video.availableResolutions,
            publicationDate: video.publicationDate
        }));
    },

    async findVideo(id: number): Promise<VideoModel | null> {
        const video = await videosCollection.findOne({ id });

        if (!video) {
            return null;
        }

        return {
            id: video.id,
            title: video.title,
            author: video.author,
            canBeDownloaded: video.canBeDownloaded,
            minAgeRestriction: video.minAgeRestriction,
            createdAt: video.createdAt,
            availableResolutions: video.availableResolutions,
            publicationDate: video.publicationDate
        };
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

        return {
            id: newVideo.id,
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded,
            minAgeRestriction: newVideo.minAgeRestriction,
            createdAt: newVideo.createdAt,
            availableResolutions: newVideo.availableResolutions,
            publicationDate: newVideo.publicationDate
        };
    },

    async updateVideo(id: number, { title, author, canBeDownloaded, minAgeRestriction, publicationDate, availableResolutions }: VideoModel): Promise<VideoModel | null> {
        const result = await videosCollection.updateOne(
            { id },
            { $set: { title, author, canBeDownloaded, minAgeRestriction, availableResolutions, publicationDate: publicationDate && new Date(publicationDate).toISOString() } }
        );

        const video = await this.findVideo(id);

        if (result.matchedCount === 1) {
            return {
                id: video!.id,
                title: video!.title,
                author: video!.author,
                canBeDownloaded: video!.canBeDownloaded,
                minAgeRestriction: video!.minAgeRestriction,
                createdAt: video!.createdAt,
                availableResolutions: video!.availableResolutions,
                publicationDate: video!.publicationDate
            };
        }

        return null;
    },

    async removeVideo(id: number): Promise<VideoModel | null> {
        const video = await this.findVideo(id);
        const result = await videosCollection.deleteOne({ id });

        if (result.deletedCount === 1) {
            return {
                id: video!.id,
                title: video!.title,
                author: video!.author,
                canBeDownloaded: video!.canBeDownloaded,
                minAgeRestriction: video!.minAgeRestriction,
                createdAt: video!.createdAt,
                availableResolutions: video!.availableResolutions,
                publicationDate: video!.publicationDate
            };
        }

        return null;
    },

    async deleteAll(): Promise<void> {
        await videosCollection.deleteMany({});
    }
};
