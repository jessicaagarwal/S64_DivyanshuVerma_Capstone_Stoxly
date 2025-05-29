const WebSocket = require('ws');
const EventEmitter = require('events');
const Portfolio = require('./models/portfolio');
require('dotenv').config();

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class AlpacaWebSocket extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.subscriptions = new Set();
    this.priceCache = new Map();
    this.updateQueue = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.connectionTimeout = null;
  }

  cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.socket) {
      try {
        this.socket.terminate();
      } catch (error) {
        console.error('Error terminating socket:', error);
      }
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isAuthenticated = false;
  }

  connect() {
    // Cleanup any existing connection first
    this.cleanup();

    const wsUrl = process.env.ALPACA_WSS_URL || 'wss://stream.data.alpaca.markets/v2/iex';
    console.log('Connecting to Alpaca WebSocket:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl, {
        handshakeTimeout: 10000,
        perMessageDeflate: false
      });

      this.socket.on('open', () => {
        console.log('Connected to Alpaca WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
      });

      this.socket.on('message', async (event) => {
        try {
          const data = JSON.parse(event);
          
          if (Array.isArray(data)) {
            const message = data[0];
            
            // Handle connection success
            if (message.T === 'success' && message.msg === 'connected') {
              console.log('WebSocket connection established');
              return;
            }
            
            // Handle authentication response
            if (message.T === 'success' && message.msg === 'authenticated') {
              console.log('Successfully authenticated with Alpaca');
              this.isAuthenticated = true;
              this.updateSubscriptions();
              return;
            }
            
            // Handle error messages
            if (message.T === 'error') {
              console.error('Alpaca WebSocket error:', message.msg);
              if (message.code === 406) {
                console.log('Connection limit exceeded. Waiting before reconnecting...');
                this.cleanup();
                this.connectionTimeout = setTimeout(() => this.connect(), 30000); // Wait 30 seconds
                return;
              }
              return;
            }
          }

          this.emit('data', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.socket.on('close', (code, reason) => {
        console.log(`Disconnected from Alpaca WebSocket. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
        this.cleanup();
        this.handleReconnect();
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        this.cleanup();
      });

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.cleanup();
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Please check your connection and Alpaca credentials.');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
    
    console.log(`Attempting to reconnect in ${this.reconnectDelay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.connectionTimeout = setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectDelay);
  }

  authenticate() {
    if (!this.isConnected) {
      console.error('Cannot authenticate: WebSocket not connected');
      return;
    }

    const authMsg = {
      action: 'auth',
      key: process.env.ALPACA_API_KEY,
      secret: process.env.ALPACA_SECRET_KEY
    };

    try {
      console.log('Sending authentication request...');
      this.socket.send(JSON.stringify(authMsg));
    } catch (error) {
      console.error('Error sending authentication request:', error);
    }
  }

  updateSubscriptions() {
    if (!this.isConnected || !this.isAuthenticated) {
      console.log('Cannot update subscriptions: WebSocket not connected or not authenticated');
      return;
    }

    if (this.subscriptions.size === 0) {
      return;
    }

    const subscribeMsg = {
      action: 'subscribe',
      quotes: Array.from(this.subscriptions)
    };

    try {
      this.socket.send(JSON.stringify(subscribeMsg));
      console.log('Subscribed to symbols:', Array.from(this.subscriptions));
    } catch (error) {
      console.error('Error sending subscription request:', error);
    }
  }

  subscribeToSymbols(symbols) {
    if (!this.isConnected || !this.isAuthenticated) {
      console.log('Cannot subscribe: WebSocket not connected or not authenticated');
      return;
    }

    symbols.forEach(symbol => this.subscriptions.add(symbol));
    this.updateSubscriptions();
  }

  unsubscribeFromSymbols(symbols) {
    if (!this.isConnected || !this.isAuthenticated) {
      console.log('Cannot unsubscribe: WebSocket not connected or not authenticated');
      return;
    }

    symbols.forEach(symbol => this.subscriptions.delete(symbol));
    const unsubscribeMsg = {
      action: 'unsubscribe',
      quotes: symbols
    };

    try {
      this.socket.send(JSON.stringify(unsubscribeMsg));
      console.log('Unsubscribed from symbols:', symbols);
    } catch (error) {
      console.error('Error sending unsubscribe request:', error);
    }
  }

  getLatestPrice(symbol) {
    return this.priceCache.get(symbol);
  }

  queuePriceUpdate(symbol, price) {
    this.priceCache.set(symbol, price);
    this.updateQueue.set(symbol, price);
  }

  async processQueuedUpdates() {
    if (this.updateQueue.size === 0) return;

    const updates = Array.from(this.updateQueue.entries()).map(([symbol, price]) => ({
      updateOne: {
        filter: { symbol },
        update: {
          $set: {
            currentPrice: price,
            lastUpdated: new Date()
          }
        }
      }
    }));

    try {
      await Portfolio.bulkWrite(updates);
      this.updateQueue.clear();
    } catch (error) {
      console.error('Error processing queued updates:', error);
    }
  }
}

const alpacaWS = new AlpacaWebSocket();
const debouncedProcessUpdates = debounce(() => {
  alpacaWS.processQueuedUpdates();
}, 5000);

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  alpacaWS.connect();

  wss.on('connection', (ws) => {
    console.log('Frontend client connected');

    const forwardData = async (data) => {
      if (ws.readyState === WebSocket.OPEN && Array.isArray(data)) {
        data.forEach(async (quote) => {
          if (quote.T === 'q') {
            const price = parseFloat(quote.p) || parseFloat(quote.bp);
            const symbol = quote.S;
        
            alpacaWS.queuePriceUpdate(symbol, price);
            debouncedProcessUpdates();

            const transformed = {
              type: 'quote',
              symbol: symbol,
              price: price,
              bid: parseFloat(quote.bp),
              ask: parseFloat(quote.ap),
              bidSize: parseInt(quote.bs),
              askSize: parseInt(quote.as),
              timestamp: quote.t
            };
            ws.send(JSON.stringify(transformed));
          }
        });
      }
    };

    alpacaWS.on('data', forwardData);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.action === 'subscribe' && Array.isArray(data.symbols)) {
          alpacaWS.subscribeToSymbols(data.symbols);
        } else if (data.action === 'unsubscribe' && Array.isArray(data.symbols)) {
          alpacaWS.unsubscribeFromSymbols(data.symbols);
        }
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    ws.on('close', () => {
      alpacaWS.removeListener('data', forwardData);
      console.log('Frontend client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

module.exports = setupWebSocketServer; 