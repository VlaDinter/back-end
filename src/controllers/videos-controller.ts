import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { VideosService } from '../domain/videos-service';

@injectable()
export class VideosController {
    constructor(
        @inject(VideosService) protected videosService: VideosService
    ) {}

    async getVideos(req: Request, res: Response) {
        const foundVideos = await this.videosService.getVideos();

        res.send(foundVideos);
    }

    async getVideo(req: Request, res: Response) {
        const foundVideo = await this.videosService.getVideo(+req.params.videoId);

        if (!foundVideo) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundVideo);
        }
    }

    async postVideos(req: Request, res: Response) {
        const createdVideo = await this.videosService.addVideo(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdVideo);
    }

    async putVideo(req: Request, res: Response) {
        const updatedVideo = await this.videosService.editVideo(+req.params.videoId, req.body);

        if (!updatedVideo) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async deleteVideo(req: Request, res: Response) {
        const deletedVideo = await this.videosService.removeVideo(+req.params.videoId);

        if (!deletedVideo) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
}
