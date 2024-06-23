import { DBVideoType } from '../types/DBVideoType';
import { VideoType } from '../types/VideoType';
import { VideoModel } from '../models/video-model';
import { injectable } from 'inversify';

@injectable()
export class VideosRepository {
    async findVideos(): Promise<DBVideoType[]> {
        return VideoModel.find({}, { _id: 0 }).lean();
    }

    async findVideo(id: number): Promise<DBVideoType | null> {
        return VideoModel.findOne({ id }, { _id: 0 }).lean();
    }

    async createVideo(newVideo: DBVideoType): Promise<DBVideoType> {
        const videoInstance = new VideoModel();

        videoInstance.id = newVideo.id;
        videoInstance.title = newVideo.title;
        videoInstance.author = newVideo.author;
        videoInstance.canBeDownloaded = newVideo.canBeDownloaded;
        videoInstance.minAgeRestriction = newVideo.minAgeRestriction;
        videoInstance.availableResolutions = newVideo.availableResolutions;
        videoInstance.publicationDate = newVideo.publicationDate;

        await videoInstance.save();

        return videoInstance;
    }

    async updateVideo(id: number, newVideo: VideoType): Promise<DBVideoType | null> {
        const videoInstance = await VideoModel.findOne({ id });

        if (!videoInstance) return null;

        videoInstance.title = newVideo.title;
        videoInstance.author = newVideo.author;
        videoInstance.canBeDownloaded = newVideo.canBeDownloaded;
        videoInstance.minAgeRestriction = newVideo.minAgeRestriction;
        videoInstance.availableResolutions = newVideo.availableResolutions;
        videoInstance.publicationDate = newVideo.publicationDate;

        const result = await videoInstance.save();

        return result;
    }

    async deleteVideo(id: number): Promise<DBVideoType | null> {
        const videoInstance = await VideoModel.findOne({ id });

        if (!videoInstance) return null;

        await videoInstance.deleteOne();

        return videoInstance;
    }

    async deleteAll(): Promise<void> {
        await VideoModel.deleteMany({});
    }
}
