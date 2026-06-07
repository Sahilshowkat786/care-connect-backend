const request = require('supertest');
const app = require('../src/app');

// NOTE: These tests require a running MongoDB instance.
// Set MONGODB_URI in .env before running.

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should return 400 if fields are missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test', email: 'test@test.com', password: 'short', role: 'patient', phone: '123', city: 'Karachi'
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 with no body', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /health', () => {
    it('should return ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
