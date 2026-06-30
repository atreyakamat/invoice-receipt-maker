import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import 'dotenv/config';
import app from '../src/app';
import prisma from '../src/utils/prisma';

let token: string;
let orgId: string;

describe('Vendor API', () => {
  beforeAll(async () => {
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Vendor',
        lastName: 'Tester',
        email: 'vendortest@example.com',
        password: 'password123',
        companyName: 'Vendor Test Inc',
      });

    token = res.body.accessToken;
    orgId = res.body.organization.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testVendor = {
    name: 'Test Vendor Corp',
    email: 'contact@testvendor.com',
    phone: '123-456-7890',
  };

  it('should create a new vendor', async () => {
    const res = await request(app)
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${token}`)
      .send(testVendor);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(testVendor.name);
  });

  it('should retrieve list of vendors', async () => {
    const res = await request(app)
      .get('/api/v1/vendors')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe(testVendor.name);
  });
});
