import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import 'dotenv/config';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Auth API', () => {
  beforeAll(async () => {
    // Clear test db before running
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'password123',
    companyName: 'Test Inc',
  };

  it('should register a new user and organization', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registration successful');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.organization.companyName).toBe(testUser.companyName);
  });

  it('should not allow duplicate registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(500); // or 400 if specifically handled
  });

  it('should login the user and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(testUser.email);
  });
});
