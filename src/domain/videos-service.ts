import { VideoOutputModel } from '../models/VideoOutputModel';
import { videosLocalRepository } from '../repositories/videos-repository';
import { DBVideoModel } from '../models/DBVideoModel';

export const videosService = {
    _mapDBVideoToVideoOutputModel(dbVideo: DBVideoModel): DBVideoModel {
        return {
            id: dbVideo.id,
            title: dbVideo.title,
            author: dbVideo.author,
            canBeDownloaded: dbVideo.canBeDownloaded,
            minAgeRestriction: dbVideo.minAgeRestriction,
            createdAt: dbVideo.createdAt,
            availableResolutions: dbVideo.availableResolutions,
            publicationDate: dbVideo.publicationDate
        };
    },

    async getVideos(): Promise<DBVideoModel[]> {
        const result = await videosLocalRepository.findVideos();

        return result.map(this._mapDBVideoToVideoOutputModel);
    },

    async getVideo(id: number): Promise<DBVideoModel | null> {
        const result = await videosLocalRepository.findVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    },

    async setVideo(newVideo: VideoOutputModel): Promise<DBVideoModel> {
        const video = {
            id: +(new Date()),
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded || false,
            minAgeRestriction: newVideo.minAgeRestriction || null,
            createdAt: new Date().toISOString(),
            availableResolutions: newVideo.availableResolutions || null,
            publicationDate: !newVideo.publicationDate ?
                new Date((new Date()).setDate((new Date()).getDate() + 1)).toISOString() :
                new Date(newVideo.publicationDate).toISOString()
        };

        return await videosLocalRepository.createVideo(video);
    },

    async editVideo(id: number, newVideo: VideoOutputModel): Promise<DBVideoModel | null> {
        const result = await videosLocalRepository.updateVideo(id, {
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded,
            minAgeRestriction: newVideo.minAgeRestriction,
            availableResolutions: newVideo.availableResolutions,
            publicationDate: newVideo.publicationDate && new Date(newVideo.publicationDate).toISOString()
        });

        return result && this._mapDBVideoToVideoOutputModel(result);
    },

    async deleteVideo(id: number): Promise<DBVideoModel | null> {
        const result = await videosLocalRepository.removeVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    },

    async deleteAll(): Promise<void> {
        await videosLocalRepository.removeAll();
    }
};
