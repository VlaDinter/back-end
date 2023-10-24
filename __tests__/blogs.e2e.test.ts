import request from 'supertest';
import { app } from '../src/app';
import { CodeResponsesEnum } from '../src/types';
import { BlogModel } from '../src/models/BlogModel';

describe('/blogs', () => {
    let newBlog: BlogModel | null = null;

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(CodeResponsesEnum.Not_content_204);
    });

    it('GET blogs = []', async () => {
        await request(app).get('/blogs/').expect([]);
    });

    it('- POST does not create the blog without authorization', async function () {
        await request(app)
            .post('/blogs/')
            .send({ name: 'test', description: 'test', websiteUrl: 'http://www.test.com/' })
            .expect(CodeResponsesEnum.Unauthorized_401);
    });

    it('- POST does not create the blog with incorrect data (no name, no description, no website url)', async function () {
        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: '', description: '', websiteUrl: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is required', field: 'name' },
                    { message: 'description is required', field: 'description' },
                    { message: 'website url is required', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the blog with incorrect data (long name, long description, long website url)', async function () {
        const longName = new Array(16).fill('1').join('');
        const longDescription = new Array(501).fill('1').join('');
        const longWebsiteUrl = `http://www.test.com/${new Array(81).fill('1').join('')}`;

        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: longName, description: longDescription, websiteUrl: longWebsiteUrl })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is too long', field: 'name' },
                    { message: 'description is too long', field: 'description' },
                    { message: 'website url is too long', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([]);
    });

    it('- POST does not create the blog with incorrect data (incorrect name, incorrect description, incorrect website url)', async function () {
        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: 1, description: 1, websiteUrl: 'test' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is invalid', field: 'name' },
                    { message: 'description is invalid', field: 'description' },
                    { message: 'website url does not match the template', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([]);
    });

    it('+ POST create new blog', async function () {
        const blog = { name: 'test', description: 'test', websiteUrl: 'http://www.test.com/' };

        await request(app)
            .post('/blogs/')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send(blog)
            .expect(CodeResponsesEnum.Created_201);

        const res = await request(app).get('/blogs/');

        newBlog = res.body[0];
        expect(res.body[0]).toEqual({
            ...newBlog,
            ...blog
        });
    });

    it('- GET blog by ID with incorrect id', async () => {
        await request(app).get('/blogs/0').expect(CodeResponsesEnum.Not_found_404);
    });

    it('+ GET blog by ID with correct id', async () => {
        await request(app)
            .get('/blogs/' + newBlog!.id)
            .expect(CodeResponsesEnum.OK_200, newBlog);
    });

    it('- PUT blog by incorrect ID', async () => {
        await request(app)
            .put('/blogs/' + 0)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: 'edit', description: 'edit', websiteUrl: 'http://www.edit.com/' })
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/blogs/');

        expect(res.body[0]).toEqual(newBlog);
    });

    it('- PUT blog without authorization', async function () {
        await request(app)
            .put('/blogs/' + newBlog!.id)
            .send({ name: 'edit', description: 'edit', websiteUrl: 'http://www.edit.com/' })
            .expect(CodeResponsesEnum.Unauthorized_401);

        const res = await request(app).get('/blogs/');

        expect(res.body[0]).toEqual(newBlog);
    });

    it('- PUT does not update the blog with incorrect data (no name, no description, no website url)', async function () {
        await request(app)
            .put('/blogs/' + newBlog!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: '', description: '', websiteUrl: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is required', field: 'name' },
                    { message: 'description is required', field: 'description' },
                    { message: 'website url is required', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([newBlog]);
    });

    it('- PUT does not update the blog with incorrect data (long name, long description, long website url)', async function () {
        const longName = new Array(16).fill('1').join('');
        const longDescription = new Array(501).fill('1').join('');
        const longWebsiteUrl = `http://www.test.com/${new Array(81).fill('1').join('')}`;

        await request(app)
            .put('/blogs/' + newBlog!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: longName, description: longDescription, websiteUrl: longWebsiteUrl })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is too long', field: 'name' },
                    { message: 'description is too long', field: 'description' },
                    { message: 'website url is too long', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([newBlog]);
    });

    it('- PUT does not update the blog with incorrect data (incorrect name, incorrect description, incorrect website url)', async function () {
        await request(app)
            .put('/blogs/' + newBlog!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send({ name: 1, description: 1, websiteUrl: 'test' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    { message: 'name is invalid', field: 'name' },
                    { message: 'description is invalid', field: 'description' },
                    { message: 'website url does not match the template', field: 'websiteUrl' }
                ],
            });

        const res = await request(app).get('/blogs/');

        expect(res.body).toEqual([newBlog]);
    });

    it('+ PUT blog by ID with correct data', async () => {
        const blog = { name: 'edit', description: 'edit', websiteUrl: 'http://www.edit.com/' };

        await request(app)
            .put('/blogs/' + newBlog!.id)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send(blog)
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/blogs/');

        newBlog = res.body[0];
        expect(res.body[0]).toEqual({
            ...newBlog,
            ...blog
        });
    });

    it('- DELETE blog by incorrect ID', async () => {
        await request(app)
            .delete('/blogs/0')
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .expect(CodeResponsesEnum.Not_found_404);

        const res = await request(app).get('/blogs/');

        expect(res.body[0]).toEqual(newBlog);
    });

    it('- DELETE blog without authorization', async function () {
        await request(app)
            .delete('/blogs/' + newBlog!.id)
            .expect(CodeResponsesEnum.Unauthorized_401);

        const res = await request(app).get('/blogs/');

        expect(res.body[0]).toEqual(newBlog);
    });

    it('+ DELETE blog by correct ID', async () => {
        await request(app)
            .delete('/blogs/' + newBlog!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204);

        const res = await request(app).get('/blogs/');

        expect(res.body.length).toBe(0);
    });
});
