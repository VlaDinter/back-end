import { db } from '../db/db';
import { VideoModel } from '../models/VideoModel';

export const videosLocalRepository = {
    findVideos(): VideoModel[] {
        return db.videos;
    },

    findVideo(id: number): VideoModel | null {
        const video = db.videos.find(video => video.id === id);

        if (!video) {
            return null;
        }

        return video;
    },

    createVideo({ title, author, canBeDownloaded, minAgeRestriction, publicationDate, availableResolutions }: VideoModel): VideoModel {
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

        db.videos.push(newVideo);

        return newVideo;
    },

    updateVideo(id: number, newVideo: VideoModel): VideoModel | null {
        const video = db.videos.find(video => video.id === id);

        if (!video) {
            return null;
        }

        video.title = newVideo.title;
        video.author = newVideo.author;

        if (newVideo.hasOwnProperty('canBeDownloaded')) {
            video.canBeDownloaded = newVideo.canBeDownloaded;
        }

        if (newVideo.hasOwnProperty('minAgeRestriction')) {
            video.minAgeRestriction = newVideo.minAgeRestriction;
        }

        if (newVideo.hasOwnProperty('publicationDate')) {
            video.publicationDate = new Date(newVideo.publicationDate as string).toISOString();
        }

        if (newVideo.hasOwnProperty('availableResolutions')) {
            video.availableResolutions = newVideo.availableResolutions;
        }

        return video;
    },

    removeVideo(id: number): VideoModel | null {
        const videoIndex = db.videos.findIndex(video => video.id === id);

        if (videoIndex < 0) {
            return null;
        }

        const removedVideos = db.videos.splice(videoIndex, 1);

        return removedVideos[0];
    },

    deleteAll(): void {
        db.videos = [];
    }
};
