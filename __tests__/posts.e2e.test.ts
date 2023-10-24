import request from 'supertest';
import { app } from '../src/app';
import { CodeResponsesEnum } from '../src/types';
import { PostModel } from '../src/models/PostModel';
import { BlogModel } from '../src/models/BlogModel';

describe('/posts', () => {
    let newPost: PostModel | null = null;
    let blog: BlogModel | null = null;
    let newBlog: BlogModel | null = null;

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(CodeResponsesEnum.Not_content_204);
        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: 'test', description: 'test', websiteUrl: 'http://www.test.com/' })
            .expect(CodeResponsesEnum.Created_201);

        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: 'test', description: 'test', websiteUrl: 'http://www.test.com/' })
            .expect(CodeResponsesEnum.Created_201);

        const res = await request(app).get('/blogs/');

        blog = res.body[0];
        newBlog = res.body[1];
    });

    it('GET posts = []', async () => {
        await request(app).get('/posts/').expect([]);
    });

    it('- POST does not create the post without authorization', async function () {
        await request(app)
            .post('/posts/')
            .send({ title: 'test', shortDescription: 'test', content: 'test', blogId: blog!.id })
            .expect(CodeResponsesEnum.Unauthorized_401);
    });

    it('- POST does not create the post with incorrect data (no title, no short description, no content, no blog id)', async function () {
        await request(app)
            .post('/posts/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: '', shortDescription: '', content: '', blogId: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is required', field: 'title' },
                    { message: 'short description is required', field: 'shortDescription' },
                    { message: 'content is required', field: 'content' },
                    { message: 'blog id is required', field: 'blogId' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the post with incorrect data (long title, long short description, long content)', async function () {
        const longTitle = new Array(31).fill('1').join('');
        const longShortDescription = new Array(101).fill('1').join('');
        const longContent = new Array(1001).fill('1').join('');

        await request(app)
            .post('/posts/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: longTitle, shortDescription: longShortDescription, content: longContent, blogId: blog!.id })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is too long', field: 'title' },
                    { message: 'short description is too long', field: 'shortDescription' },
                    { message: 'content is too long', field: 'content' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the post with incorrect data (incorrect title, incorrect short description, incorrect content, incorrect blog id)', async function () {
        await request(app)
            .post('/posts/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: 1, shortDescription: 1, content: 1, blogId: 1 })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is invalid', field: 'title' },
                    { message: 'short description is invalid', field: 'shortDescription' },
                    { message: 'content is invalid', field: 'content' },
                    { message: 'blog id is invalid', field: 'blogId' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([]);
    });

    it('+ POST create new post', async function () {
        const post = { title: 'test', shortDescription: 'test', content: 'test', blogId: blog!.id };

        await request(app)
            .post('/posts/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send(post)
            .expect(CodeResponsesEnum.Created_201);

        const res = await request(app).get('/posts/');

        newPost = res.body[0];
        expect(res.body[0]).toEqual({
            ...newPost,
            ...post
        });
    });

    it('- GET post by ID with incorrect id', async () => {
        await request(app).get('/posts/0').expect(CodeResponsesEnum.Not_found_404);
    });

    it('+ GET post by ID with correct id', async () => {
        await request(app)
            .get('/posts/' + newPost!.id)
            .expect(CodeResponsesEnum.OK_200, newPost);
    });

    it('- PUT post by incorrect ID', async () => {
        await request(app)
            .put('/posts/' + 0)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: 'edit', shortDescription: 'edit', content: 'edit', blogId: newBlog!.id })
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/posts/');

        expect(res.body[0]).toEqual(newPost);
    });

    it('- PUT post without authorization', async function () {
        await request(app)
            .put('/posts/' + newPost!.id)
            .send({ title: 'edit', shortDescription: 'edit', content: 'edit', blogId: newBlog!.id })
            .expect(CodeResponsesEnum.Unauthorized_401);

        const res = await request(app).get('/posts/');

        expect(res.body[0]).toEqual(newPost);
    });

    it('- PUT does not update the post with incorrect data (no title, no short description, no content, no blog id)', async function () {
        await request(app)
            .put('/posts/' + newPost!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: '', shortDescription: '', content: '', blogId: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is required', field: 'title' },
                    { message: 'short description is required', field: 'shortDescription' },
                    { message: 'content is required', field: 'content' },
                    { message: 'blog id is required', field: 'blogId' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([newPost]);
    });

    it('- PUT does not update the post with incorrect data (long title, long short description, long content)', async function () {
        const longTitle = new Array(31).fill('1').join('');
        const longShortDescription = new Array(101).fill('1').join('');
        const longContent = new Array(1001).fill('1').join('');

        await request(app)
            .put('/posts/' + newPost!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: longTitle, shortDescription: longShortDescription, content: longContent, blogId: newBlog!.id })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is too long', field: 'title' },
                    { message: 'short description is too long', field: 'shortDescription' },
                    { message: 'content is too long', field: 'content' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([newPost]);
    });

    it('- PUT does not update the post with incorrect data (incorrect title, incorrect short description, incorrect content, incorrect blog id)', async function () {
        await request(app)
            .put('/posts/' + newPost!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ title: 1, shortDescription: 1, content: 1, blogId: 1 })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'title is invalid', field: 'title' },
                    { message: 'short description is invalid', field: 'shortDescription' },
                    { message: 'content is invalid', field: 'content' },
                    { message: 'blog id is invalid', field: 'blogId' }
                ],
            });

        const res = await request(app).get('/posts/');

        expect(res.body).toEqual([newPost]);
    });

    it('+ PUT post by ID with correct data', async () => {
        const post = { title: 'edit', shortDescription: 'edit', content: 'edit', blogId: newBlog!.id };

        await request(app)
            .put('/posts/' + newPost!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send(post)
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/posts/');

        newPost = res.body[0];
        expect(res.body[0]).toEqual({
            ...newPost,
            ...post
        });
    });

    it('- DELETE post by incorrect ID', async () => {
        await request(app)
            .delete('/posts/0')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/posts/');

        expect(res.body[0]).toEqual(newPost);
    });

    it('- DELETE post without authorization', async function () {
        await request(app)
            .delete('/posts/' + newPost!.id)
            .expect(CodeResponsesEnum.Unauthorized_401);

        const res = await request(app).get('/posts/');

        expect(res.body[0]).toEqual(newPost);
    });

    it('+ DELETE post by correct ID', async () => {
        await request(app)
            .delete('/posts/' + newPost!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/posts/');

        expect(res.body.length).toBe(0);
    });
});
