const request = require('supertest');
const { app } = require('./testServer');

// Mock WebSocket
jest.mock('../websocket', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    cleanup: jest.fn()
  }));
});

describe('Market Data Endpoints', () => {
  describe('GET /api/stock/price', () => {
    it('should get stock price for a date', async () => {
      const response = await request(app)
        .get('/api/stock/price?symbol=AAPL&date=2024-03-20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('symbol', 'AAPL');
      expect(response.body).toHaveProperty('date', '2024-03-20');
      expect(response.body).toHaveProperty('closingPrice');
      expect(typeof response.body.closingPrice).toBe('number');
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .get('/api/stock/price?symbol=AAPL');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/news', () => {
    it('should get news for specified symbols', async () => {
      const response = await request(app)
        .get('/api/news?symbols=AAPL,MSFT');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('AAPL');
      expect(response.body).toHaveProperty('MSFT');
      expect(Array.isArray(response.body.AAPL)).toBe(true);
    });

    it('should return 400 for missing symbols', async () => {
      const response = await request(app)
        .get('/api/news');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/asset-names', () => {
    it('should get company names for symbols', async () => {
      const response = await request(app)
        .get('/api/asset-names?symbols=AAPL,MSFT');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('AAPL');
      expect(response.body).toHaveProperty('MSFT');
      expect(typeof response.body.AAPL).toBe('string');
    });

    it('should return 400 for missing symbols', async () => {
      const response = await request(app)
        .get('/api/asset-names');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/market/latest-bars', () => {
    it('should get latest market bars', async () => {
      const response = await request(app)
        .get('/api/market/latest-bars?symbols=AAPL,MSFT');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('AAPL');
      expect(response.body.AAPL).toHaveProperty('c'); // closing price
      expect(response.body.AAPL).toHaveProperty('h'); // high price
      expect(response.body.AAPL).toHaveProperty('l'); // low price
      expect(response.body.AAPL).toHaveProperty('o'); // opening price
      expect(response.body.AAPL).toHaveProperty('v'); // volume
    });

    it('should return 400 for missing symbols', async () => {
      const response = await request(app)
        .get('/api/market/latest-bars');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/market/market-movers', () => {
    it('should get top gainers and losers', async () => {
      const response = await request(app)
        .get('/api/market/market-movers');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gainers');
      expect(response.body).toHaveProperty('losers');
      expect(Array.isArray(response.body.gainers)).toBe(true);
      expect(Array.isArray(response.body.losers)).toBe(true);
      
      if (response.body.gainers.length > 0) {
        expect(response.body.gainers[0]).toHaveProperty('symbol');
        expect(response.body.gainers[0]).toHaveProperty('name');
        expect(response.body.gainers[0]).toHaveProperty('change');
      }
    });
  });

  describe('GET /api/market/yesterday-close', () => {
    it('should get yesterday closing prices', async () => {
      const response = await request(app)
        .get('/api/market/yesterday-close?symbols=AAPL,MSFT');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('AAPL');
      expect(response.body).toHaveProperty('MSFT');
      expect(typeof response.body.AAPL).toBe('number');
    });

    it('should return 400 for missing symbols', async () => {
      const response = await request(app)
        .get('/api/market/yesterday-close');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/market/calendar', () => {
    it('should get market calendar information', async () => {
      const response = await request(app)
        .get('/api/market/calendar');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('open');
      expect(response.body[0]).toHaveProperty('close');
      expect(response.body[0]).toHaveProperty('session_open');
      expect(response.body[0]).toHaveProperty('session_close');
    });
  });
}); 