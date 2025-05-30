const { app, server } = require('../server');

let isServerRunning = false;

const startServer = () => {
  if (!isServerRunning) {
    server.listen(0); // Use port 0 to get a random available port
    isServerRunning = true;
  }
  return server;
};

const stopServer = () => {
  if (isServerRunning) {
    return new Promise((resolve) => {
      // Close all connections
      server.getConnections((err, count) => {
        if (err) {
          server.close(() => {
            isServerRunning = false;
            resolve();
          });
          return;
        }
        
        if (count === 0) {
          server.close(() => {
            isServerRunning = false;
            resolve();
          });
          return;
        }

        // Force close all connections
        server.close(() => {
          isServerRunning = false;
          resolve();
        });
      });
    });
  }
  return Promise.resolve();
};

module.exports = {
  app,
  server,
  startServer,
  stopServer
}; 