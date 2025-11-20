const path = require('path');
const fs = require('fs/promises');
const request = require('supertest');
const app = require('./index');

const submissionsFile = path.join(__dirname, '..', 'data', 'contact-submissions.json');
const newsletterFile = path.join(__dirname, '..', 'data', 'newsletter-subscribers.json');

async function deleteFileIfExists(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}

async function resetSubmissionStore() {
    await deleteFileIfExists(submissionsFile);
}

async function resetNewsletterStore() {
    await deleteFileIfExists(newsletterFile);
}

describe('ARCHIKMOR contact API', () => {
    beforeEach(async () => {
        await resetSubmissionStore();
    });

    afterAll(async () => {
        await resetSubmissionStore();
    });

    it('responds with ok status on /health', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    it('returns 400 when required fields are missing', async () => {
        const response = await request(app)
            .post('/api/contact')
            .send({ name: 'Test User' })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('stores contact submission on success', async () => {
        const payload = {
            name: 'Test User',
            email: 'test@example.com',
            project: 'Residential',
            message: 'Looking for a new design.',
        };

        const response = await request(app)
            .post('/api/contact')
            .send(payload)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ success: true });

        const stored = JSON.parse(await fs.readFile(submissionsFile, 'utf-8'));
        expect(Array.isArray(stored)).toBe(true);
        expect(stored).toHaveLength(1);
        expect(stored[0]).toMatchObject({
            name: payload.name,
            email: payload.email.toLowerCase(),
            project: payload.project,
            message: payload.message,
        });
        expect(stored[0]).toHaveProperty('id');
        expect(stored[0]).toHaveProperty('receivedAt');
    });
});

describe('ARCHIKMOR newsletter API', () => {
    beforeEach(async () => {
        await resetNewsletterStore();
    });

    afterAll(async () => {
        await resetNewsletterStore();
    });

    it('requires a valid email address', async () => {
        const response = await request(app)
            .post('/api/newsletter')
            .send({ name: 'No Email' })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('stores newsletter subscriptions and avoids duplicates', async () => {
        const payload = { name: 'Subscriber', email: 'subscriber@example.com' };

        const firstResponse = await request(app)
            .post('/api/newsletter')
            .send(payload)
            .set('Content-Type', 'application/json');

        expect(firstResponse.status).toBe(201);
        expect(firstResponse.body).toMatchObject({ success: true });

        const secondResponse = await request(app)
            .post('/api/newsletter')
            .send(payload)
            .set('Content-Type', 'application/json');

        expect(secondResponse.status).toBe(200);
        expect(secondResponse.body).toMatchObject({ success: true });

        const stored = JSON.parse(await fs.readFile(newsletterFile, 'utf-8'));
        expect(stored).toHaveLength(1);
        expect(stored[0]).toMatchObject({
            name: payload.name,
            email: payload.email,
        });
        expect(stored[0]).toHaveProperty('id');
        expect(stored[0]).toHaveProperty('subscribedAt');
    });
});

