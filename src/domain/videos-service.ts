import { VideoType } from '../types/VideoType';
import { VideosRepository } from '../repositories/videos-repository';
import { DBVideoType } from '../types/DBVideoType';
import { inject, injectable } from 'inversify';

@injectable()
export class VideosService {
    constructor(
        @inject(VideosRepository) protected videosRepository: VideosRepository
    ) {}

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
    }

    async getVideos(): Promise<DBVideoType[]> {
        const result = await this.videosRepository.findVideos();

        return result.map(this._mapDBVideoToVideoOutputModel);
    }

    async getVideo(id: number): Promise<DBVideoType | null> {
        const result = await this.videosRepository.findVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    }

    async addVideo(newVideo: VideoType): Promise<DBVideoType> {
        const video = {
            id: +(new Date()),
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded,
            minAgeRestriction: newVideo.minAgeRestriction,
            availableResolutions: newVideo.availableResolutions,
            publicationDate: newVideo.publicationDate && new Date(newVideo.publicationDate).toISOString()
        };

        const result = await this.videosRepository.createVideo(video);

        return this._mapDBVideoToVideoOutputModel(result);
    }

    async editVideo(id: number, newVideo: VideoType): Promise<DBVideoType | null> {
        const result = await this.videosRepository.updateVideo(id, {
            title: newVideo.title,
            author: newVideo.author,
            canBeDownloaded: newVideo.canBeDownloaded,
            minAgeRestriction: newVideo.minAgeRestriction,
            availableResolutions: newVideo.availableResolutions,
            publicationDate: newVideo.publicationDate && new Date(newVideo.publicationDate).toISOString()
        });

        return result && this._mapDBVideoToVideoOutputModel(result);
    }

    async removeVideo(id: number): Promise<DBVideoType | null> {
        const result = await this.videosRepository.deleteVideo(id);

        return result && this._mapDBVideoToVideoOutputModel(result);
    }

    async removeAll(): Promise<void> {
        await this.videosRepository.deleteAll();
    }
}
