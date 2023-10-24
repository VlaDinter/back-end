import { BlogModel } from './BlogModel';
import { PostModel } from './PostModel';
import { VideoModel } from './VideoModel';

export type DBModel = {
    blogs: BlogModel[],
    posts: PostModel[],
    videos: VideoModel[]
};
