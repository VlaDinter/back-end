import { VideoOutputType } from '../types/VideoOutputType';
import { videosLocalRepository } from '../repositories/videos-repository';
import { DBVideoType } from '../types/DBVideoType';

export const videosService = {
    _mapDBVideoToVideoOutputModel(dbVideo: DBVideoType): DBVideoType {
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

    async getVideos(): Promise<DBVideoType[]> {
        const result = await videosLocalRepository.findVideos();

        return result.map(this._mapDBVideoToVideoOutputModel);
    },

    async getVideo(id: number): Promise<DBVideoType | null> {
        const result = await videosLocalRepository.findVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    },

    async setVideo(newVideo: VideoOutputType): Promise<DBVideoType> {
        const video = {
            id: +(new Date()),
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded,
            minAgeRestriction: newVideo.minAgeRestriction,
            availableResolutions: newVideo.availableResolutions,
            publicationDate: newVideo.publicationDate && new Date(newVideo.publicationDate).toISOString()
        };

        const result = await videosLocalRepository.createVideo(video);

        return this._mapDBVideoToVideoOutputModel(result);
    },

    async editVideo(id: number, newVideo: VideoOutputType): Promise<DBVideoType | null> {
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

    async deleteVideo(id: number): Promise<DBVideoType | null> {
        const result = await videosLocalRepository.removeVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    },

    async deleteAll(): Promise<void> {
        await videosLocalRepository.removeAll();
    }
};
