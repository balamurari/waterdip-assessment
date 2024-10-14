import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './Dashboard.css';

interface BookingData {
  hotel: string;
  arrival_date_year: string;
  arrival_date_month: string;
  arrival_date_day_of_month: string;
  adults: number;
  children: number;
  babies: number;
  country: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<BookingData[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<BookingData[]>([]);

  useEffect(() => {
    // Fetch data from the JSON file
    axios.get('/hotel_bookings.json')
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data); // Set initial data
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = data.filter(booking => {
        const arrivalDate = new Date(
          `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`
        );
        return arrivalDate >= new Date(startDate) && arrivalDate <= new Date(endDate);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // Reset to original data if no date is selected
    }
  }, [startDate, endDate, data]);

  // Preparing data for the charts
  const countries = filteredData.reduce((acc: Record<string, number>, booking) => {
    acc[booking.country] = (acc[booking.country] || 0) + 1;
    return acc;
  }, {});

  const totalVisitors = filteredData.map(d => d.adults + d.children);

  const countrySeries = Object.values(countries);
  const countryLabels = Object.keys(countries);

  const timeSeriesData = filteredData.map(d => ({
    x: `${d.arrival_date_year}-${d.arrival_date_month}-${d.arrival_date_day_of_month}`,
    y: d.adults + d.children
  }));

  // Render charts using ApexCharts
  return (
    <div className="dashboard-container">
      <h1>Hotel Dashboard</h1>

      <div className="date-picker">
        <label htmlFor="start-date">Start Date:</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label htmlFor="end-date">End Date:</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Time Series Chart for Visitors per Day */}
      <Chart
        options={{
          chart: { id: 'time-series' },
          xaxis: { type: 'datetime' },
          title: { text: 'Visitors per Day' },
        }}
        series={[{ name: 'Visitors', data: timeSeriesData }]}
        type="line"
        height={350}
      />

      {/* Column Chart for Visitors per Country */}
      <Chart
        options={{
          chart: { id: 'visitors-country' },
          xaxis: { categories: countryLabels },
          title: { text: 'Visitors per Country' },
        }}
        series={[{ name: 'Visitors', data: countrySeries }]}
        type="bar"
        height={350}
      />

      {/* Sparkline Chart for Adults */}
      <Chart
        options={{
          chart: { id: 'sparkline-adults', sparkline: { enabled: true } },
          title: { text: 'Adult Visitors' },
        }}
        series={[{ name: 'Adults', data: filteredData.map(d => d.adults) }]}
        type="area"
        height={160}
      />

      {/* Sparkline Chart for Children */}
      <Chart
        options={{
          chart: { id: 'sparkline-children', sparkline: { enabled: true } },
          title: { text: 'Children Visitors' },
        }}
        series={[{ name: 'Children', data: filteredData.map(d => d.children) }]}
        type="area"
        height={160}
      />
    </div>
  );
};

export default Dashboard;
