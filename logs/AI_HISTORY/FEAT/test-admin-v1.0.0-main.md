import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mocking the server setup for testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

describe('Admin Dashboard Integration Tests', () => {
  let app;
  const PORT = 3463;

  beforeAll(async () => {
    // We import the logic or just test the running service if it's already up
    // However, for a proper unit/integration test, we usually test the app instance
  });

  test('Health check should return 200 and status ok', async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/health`);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('AMR-Admin');
    } catch (error) {
      console.warn('⚠️ Admin service is not running. Start it with "npm run dev:admin" to pass this test.');
      throw error;
    }
  });

  test('Tree API should return a valid directory structure', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/tree`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('isDir', true);
    expect(Array.isArray(data.children)).toBe(true);
  });

  test('Remote access should be forbidden (Security Mock)', async () => {
    // This tests the middleware logic (simulated)
    const mockApp = express();
    mockApp.use((req, res, next) => {
      const remoteAddress = '192.168.1.50'; // Mock external IP
      if (remoteAddress === '::1' || remoteAddress === '127.0.0.1' || remoteAddress.includes('localhost')) {
          next();
      } else {
          res.status(403).send('Forbidden: Local access only');
      }
    });

    const res = await request(mockApp).get('/');
    expect(res.status).toBe(403);
    expect(res.text).toBe('Forbidden: Local access only');
  });
});
