import request from 'supertest';
import { app } from '../src/app';
import { CodeResponsesEnum } from '../src/types';
import { VideoModel } from '../src/models/VideoModel';

describe('/videos', () => {
    let newVideo: VideoModel | null = null;

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(CodeResponsesEnum.Not_content_204);
    });

    it('GET videos = []', async () => {
        await request(app).get('/videos/').expect([]);
    });

    it('- POST does not create the video with incorrect data (no title, no author)', async function () {
        await request(app)
            .post('/videos/')
            .send({ title: '', author: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is required', field: 'title' },
                    { message: 'author is required', field: 'author' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the video with incorrect data (long title, long author)', async function () {
        const longTitle = new Array(41).fill('1').join('');
        const longAuthor = new Array(21).fill('1').join('');

        await request(app)
            .post('/videos/')
            .send({ title: longTitle, author: longAuthor })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is too long', field: 'title' },
                    { message: 'author is too long', field: 'author' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the video with incorrect data (incorrect title, incorrect author, incorrect can be downloaded, incorrect min age restriction, incorrect publication date, incorrect available resolutions)', async function () {
        await request(app)
            .post('/videos/')
            .send({ title: 1, author: 1, canBeDownloaded: 1, minAgeRestriction: 0, publicationDate: 'test', availableResolutions: ['test'] })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is invalid', field: 'title' },
                    { message: 'author is invalid', field: 'author' },
                    { message: 'can be downloaded is invalid', field: 'canBeDownloaded' },
                    { message: 'min age restriction is invalid', field: 'minAgeRestriction' },
                    { message: 'publication date is invalid', field: 'publicationDate' },
                    { message: 'available resolutions is invalid', field: 'availableResolutions' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([]);
    });

    it('+ POST create new video', async function () {
        const video = { title: 'title', author: 'author', canBeDownloaded: true, minAgeRestriction: 1, publicationDate: '2023-01-12T08:12:39.261Z', availableResolutions: ['P144'] };

        await request(app)
            .post('/videos/')
            .send(video)
            .expect(CodeResponsesEnum.Created_201);

        const res = await request(app).get('/videos/');

        newVideo = res.body[0];
        expect(res.body[0]).toEqual({
            ...newVideo,
            ...video
        });
    });

    it('- GET video by ID with incorrect id', async () => {
        await request(app).get('/videos/helloWorld').expect(404);
    });

    it('+ GET video by ID with correct id', async () => {
        await request(app)
            .get('/videos/' + newVideo!.id)
            .expect(200, newVideo);
    });

    it('- PUT video by incorrect ID', async () => {
        await request(app)
            .put('/videos/' + 1223)
            .send({ title: 'title', author: 'title' })
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/videos/');

        expect(res.body[0]).toEqual(newVideo);
    });

    it('- PUT does not update the video with incorrect data (no title, no author)', async function () {
        await request(app)
            .put('/videos/' + newVideo!.id)
            .send({ title: '', author: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is required', field: 'title' },
                    { message: 'author is required', field: 'author' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([newVideo]);
    });

    it('- PUT does not update the video with incorrect data (long title, long author)', async function () {
        const longTitle = new Array(41).fill('1').join('');
        const longAuthor = new Array(21).fill('1').join('');

        await request(app)
            .put('/videos/' + newVideo!.id)
            .send({ title: longTitle, author: longAuthor })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is too long', field: 'title' },
                    { message: 'author is too long', field: 'author' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([newVideo]);
    });

    it('- PUT does not update the video with incorrect data (incorrect title, incorrect author, incorrect can be downloaded, incorrect min age restriction, incorrect publication date, incorrect available resolutions)', async function () {
        await request(app)
            .put('/videos/' + newVideo!.id)
            .send({ title: 1, author: 1, canBeDownloaded: 1, minAgeRestriction: 19, publicationDate: 1, availableResolutions: [] })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is invalid', field: 'title' },
                    { message: 'author is invalid', field: 'author' },
                    { message: 'can be downloaded is invalid', field: 'canBeDownloaded' },
                    { message: 'min age restriction is invalid', field: 'minAgeRestriction' },
                    { message: 'publication date is invalid', field: 'publicationDate' },
                    { message: 'available resolutions is invalid', field: 'availableResolutions' }
                ],
            });

        const res = await request(app).get('/videos/');

        expect(res.body).toEqual([newVideo]);
    });

    it('+ PUT video by ID with correct data', async () => {
        const video = { title: 'title', author: 'author', canBeDownloaded: true, minAgeRestriction: 1, publicationDate: '2023-01-12T08:12:39.261Z', availableResolutions: ['P144', 'P2160'] };

        await request(app)
            .put('/videos/' + newVideo!.id)
            .send(video)
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/videos/');

        newVideo = res.body[0];
        expect(res.body[0]).toEqual({
            ...newVideo,
            ...video
        });
    });

    it('- DELETE video by incorrect ID', async () => {
        await request(app)
            .delete('/videos/876328')
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/videos/');

        expect(res.body[0]).toEqual(newVideo);
    });

    it('+ DELETE video by correct ID', async () => {
        await request(app)
            .delete('/videos/' + newVideo!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/videos/');

        expect(res.body.length).toBe(0);
    });
});
