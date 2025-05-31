import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketCalendar.css';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const MarketCalendar = () => {
  const [marketStatus, setMarketStatus] = useState('Loading...');
  const [error, setError] = useState('');

  const checkMarketStatus = async () => {
    try {
      // Get current time in Eastern Time
      const now = new Date();
      const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      
      // Check if it's a weekday (0 = Sunday, 6 = Saturday)
      const isWeekday = etTime.getDay() !== 0 && etTime.getDay() !== 6;
      
      // Market hours in ET (9:30 AM - 4:00 PM)
      const marketOpen = new Date(etTime);
      marketOpen.setHours(9, 30, 0, 0);
      
      const marketClose = new Date(etTime);
      marketClose.setHours(16, 0, 0, 0);

      // Fetch calendar data for today
      const year = etTime.getFullYear();
      const month = (etTime.getMonth() + 1).toString().padStart(2, '0');
      const day = etTime.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const response = await axios.get(`${API_BASE_URL}/api/market/calendar`, {
        params: { start: formattedDate, end: formattedDate }
      });

      const calendarDay = response.data && response.data.length > 0 ? response.data[0] : null;

      if (!calendarDay) {
        setMarketStatus('Closed (Holiday)');
        return;
      }

      // Check if current time is within market hours
      if (isWeekday && etTime >= marketOpen && etTime < marketClose) {
        setMarketStatus('Open');
      } else {
        setMarketStatus('Closed');
      }

    } catch (err) {
      setError('Failed to fetch market status');
      setMarketStatus('Unknown');
      console.error('Error fetching calendar:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    // Initial check
    checkMarketStatus();

    // Set up interval to check every minute
    const interval = setInterval(() => {
      checkMarketStatus();
    }, 60 * 1000); // Check every minute

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  if (error) {
    return <div className="market-status-error">{error}</div>;
  }

  return (
    <div className={`market-status ${marketStatus.toLowerCase()}`}>
      Market Status: {marketStatus}
    </div>
  );
};

export default MarketCalendar; 