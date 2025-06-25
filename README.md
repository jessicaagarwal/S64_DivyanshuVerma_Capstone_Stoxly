# Stock Market Portfolio Tracker

[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/) [![Express](https://img.shields.io/badge/API-Express-black?logo=express)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)](https://www.mongodb.com/) [![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)](https://jwt.io/) [![Alpaca](https://img.shields.io/badge/Stock%20Data-Alpaca-0055FF?logo=alpaca)](https://alpaca.markets/) [![Three.js](https://img.shields.io/badge/3D-Three.js-000?logo=three.js)](https://threejs.org/)

## Overview

**Stock Market Portfolio Tracker** is a modern web application that empowers users to efficiently manage and analyze their stock investments. With real-time market data, interactive dashboards, and advanced visualization, it provides a seamless experience for both casual investors and active traders.

## Features
- **User Authentication:** Secure login and registration with JWT.
- **Portfolio Management:** Add, edit, and delete stocks in your portfolio.
- **Real-Time Data:** Live stock prices and market updates via WebSocket and Alpaca API.
- **Performance Analytics:** Visualize profits, losses, and historical trends.
- **3D Interactive UI:** Engaging landing page and charts powered by Three.js.
- **News & Insights:** Stay updated with the latest market news and movers.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **Stock Data:** Alpaca API, WebSocket
- **3D Visualization:** Three.js

## Getting Started

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Alpaca API key

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/stock-portfolio-tracker.git
   cd stock-portfolio-tracker
   ```
2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Set up environment variables:**
   - Create `.env` files in both `backend` and `frontend` directories (see `.env.example` if available).
4. **Run the application:**
   - Start backend:
     ```bash
     cd backend && npm start
     ```
   - Start frontend:
     ```bash
     cd frontend && npm run dev
     ```

## Usage
- Register or log in to your account.
- Add stocks to your portfolio and track their performance in real time.
- Explore interactive charts and 3D visualizations.
- Stay informed with live news and market movers.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## License
This project is licensed under the MIT License.
