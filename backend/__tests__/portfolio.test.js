const request = require('supertest');
const { app } = require('./testServer');
const User = require('../models/user');
const Portfolio = require('../models/portfolio');

// Mock WebSocket
jest.mock('../websocket', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    cleanup: jest.fn()
  }));
});

let authToken;
let testUserId;

beforeAll(async () => {
  // Create test user and get auth token
  const user = await User.create({
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'testPassword123'
  });
  
  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
      password: 'testPassword123'
    });
  
  authToken = loginResponse.body.token;
  testUserId = user._id;
});

describe('Portfolio Endpoints', () => {
  beforeEach(async () => {
    await Portfolio.deleteMany({});
  });

  describe('POST /api/portfolio', () => {
    it('should add stock to portfolio', async () => {
      const stockData = {
        symbol: 'AAPL',
        date: '2024-03-20',
        quantity: 10
      };

      const response = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(stockData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('symbol', stockData.symbol);
      expect(response.body).toHaveProperty('quantity', stockData.quantity);
      expect(response.body).toHaveProperty('closingPrice');
      expect(response.body).toHaveProperty('currentPrice');
    });

    it('should not add stock without authentication', async () => {
      const response = await request(app)
        .post('/api/portfolio')
        .send({
          symbol: 'AAPL',
          date: '2024-03-20',
          quantity: 10
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/portfolio', () => {
    beforeEach(async () => {
      // Add test portfolio entries
      await Portfolio.create({
        user: testUserId,
        symbol: 'AAPL',
        date: new Date('2024-03-20'),
        closingPrice: 175.50,
        currentPrice: 176.20,
        quantity: 10,
        totalValue: 1755.00
      });
    });

    it('should get user portfolio', async () => {
      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('portfolio');
      expect(Array.isArray(response.body.portfolio)).toBe(true);
      expect(response.body.portfolio[0]).toHaveProperty('symbol', 'AAPL');
    });
  });

  describe('PUT /api/portfolio/:symbol/:date', () => {
    beforeEach(async () => {
      await Portfolio.create({
        user: testUserId,
        symbol: 'AAPL',
        date: new Date('2024-03-20'),
        closingPrice: 175.50,
        currentPrice: 176.20,
        quantity: 10,
        totalValue: 1755.00
      });
    });

    it('should update stock quantity', async () => {
      const response = await request(app)
        .put('/api/portfolio/AAPL/2024-03-20')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 15
        });

      expect(response.status).toBe(200);
      expect(response.body.stock).toHaveProperty('quantity', 15);
    });

    it('should update stock date', async () => {
      const response = await request(app)
        .put('/api/portfolio/AAPL/2024-03-20')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 10,
          newDate: '2024-03-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.stock).toHaveProperty('date');
      expect(new Date(response.body.stock.date).toISOString().split('T')[0]).toBe('2024-03-21');
    });
  });

  describe('DELETE /api/portfolio/:symbol', () => {
    beforeEach(async () => {
      await Portfolio.create({
        user: testUserId,
        symbol: 'AAPL',
        date: new Date('2024-03-20'),
        closingPrice: 175.50,
        currentPrice: 176.20,
        quantity: 10,
        totalValue: 1755.00
      });
    });

    it('should delete stock from portfolio', async () => {
      const response = await request(app)
        .delete('/api/portfolio/AAPL?date=2024-03-20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Stock(s) removed successfully');
      expect(response.body).toHaveProperty('deletedCount', 1);
    });
  });
}); 