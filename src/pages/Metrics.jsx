// Metrics.jsx
// Dashboard page that displays key system analytics like bookings, revenue, and venue usage.

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { apiFetch } from '../utils/api';

const COLORS = ["#623E2A", "#A1866F", "#CBB6A2", "#d9a66b", "#f0c987"];

const Metrics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [typeFilter, setTypeFilter] = useState('all');
  const [boxFade, setBoxFade] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(
          `/api/metrics-data?range=${timeRange}&type=${typeFilter}`, {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch metrics');

        setData(json.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [timeRange, typeFilter]);

  // Animate metric boxes on filter change
  useEffect(() => {
    setBoxFade(false);
    const timeout = setTimeout(() => setBoxFade(true), 100);
    return () => clearTimeout(timeout);
  }, [data]);

  return (
    <div className="fade-in">
      <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>📊 Innovation Park Analytics Dashboard</h2>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {!data && !error && <p className="text-center mt-4">Loading metrics...</p>}

        {data && (
          <>
            {/* Filters */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <label><strong>Time Range:</strong></label>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                style={filterStyle}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">This Month</option>
                <option value="all">All Time</option>
              </select>

              <label style={{ marginLeft: '40px' }}><strong>Booking Type:</strong></label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={filterStyle}
              >
                <option value="all">All</option>
                <option value="event">Event Only</option>
                <option value="venue">Venue Only</option>
              </select>
            </div>

            {/* Metrics Summary Boxes */}
            <div style={{ ...grid, opacity: boxFade ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              <MetricBox title="Tickets Sold" value={data.ticketsSold} />
              <MetricBox title="Total Revenue" value={`EGP ${data?.totalRevenue?.toLocaleString?.() ?? '—'}`} />
              <MetricBox title="Top Venue" value={data.topVenue || '—'} />
            </div>

            {/* Charts */}
            <h3 style={sectionHeader}>📍 Venue Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.venueUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#623E2A" />
              </BarChart>
            </ResponsiveContainer>

            <h3 style={sectionHeader}>📈 Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#A1866F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>

            <h3 style={sectionHeader}>🥧 Ticket Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.ticketType}
                  dataKey="value"
                  nameKey="type"
                  outerRadius={100}
                  label
                >
                  {(data?.ticketType ?? []).map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

const MetricBox = ({ title, value }) => (
  <div style={boxStyle}>
    <h4>{title}</h4>
    <p style={{ fontSize: '24px', margin: 0 }}>{value}</p>
  </div>
);

// Chart Styles
const grid = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '40px'
};

const boxStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  width: '240px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const sectionHeader = {
  marginTop: '40px',
  textAlign: 'center'
};

const filterStyle = {
  padding: '8px',
  fontSize: '16px',
  marginLeft: '10px',
  width: '180px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

export default Metrics;
