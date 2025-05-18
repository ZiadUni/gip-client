// Metrics.jsx
// Dashboard page that displays key system analytics like bookings, revenue, and venue usage.

import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ["#623E2A", "#A1866F", "#CBB6A2", "#d9a66b", "#f0c987"];

const Metrics = () => {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('current');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const pageRef = useRef();
  const [refreshTimer, setRefreshTimer] = useState(0);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      let url = `/metrics-data?from=${startDate}&to=${endDate}&type=${typeFilter}&status=${statusFilter}`;
      if (selectedVenue) url += `&venue=${encodeURIComponent(selectedVenue)}`;
      const res = await apiFetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch metrics');
      setData(json.data);
      setLastRefreshed(Date.now());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const tick = setInterval(() => {
      setRefreshTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const exportToCSV = (dataArray, filename) => {
    if (!dataArray || !dataArray.length) return;
    const keys = Object.keys(dataArray[0]);
    const csvContent = [
      keys.join(','),
      ...dataArray.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const container = pageRef.current.cloneNode(true);
    container.style.padding = '40px';
    container.style.background = '#fff';
    container.style.maxWidth = '900px';
    container.style.margin = 'auto';
    document.body.appendChild(container);
    html2canvas(container, { backgroundColor: '#ffffff' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('metrics-dashboard.pdf');
      document.body.removeChild(container);
    });
  };

  return (
    <div className="fade-in" ref={pageRef}>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>📊 Innovation Park Analytics Dashboard</h2>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {!data && !error && <p className="text-center mt-4">Loading metrics...</p>}

        {/* Filters */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <div className="mb-3" style={{ display: 'flex', justifyContent: 'center' }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            whiteSpace: 'nowrap'
          }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => {
                setAutoRefresh(e.target.checked);
                if (e.target.checked) setLastRefreshed(Date.now());
              }}
            />
            Auto-refresh every 20 seconds
          </label>
        </div>

          {autoRefresh && lastRefreshed && (
            <p className="text-muted text-center mb-3" style={{ fontSize: '14px' }}>
              Last refreshed: {Math.floor((Date.now() - lastRefreshed) / 1000)} seconds ago
            </p>
          )}

          <h5>🕒 Time Range Filter</h5>
          <label><strong>Start Date:</strong></label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={filterStyle}
          />
          <label style={{ marginLeft: '20px' }}><strong>End Date:</strong></label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={filterStyle}
          />

          <div style={{ marginTop: '15px' }}>
            <label><strong>Status:</strong></label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="current">Current</option>
              <option value="past">Past</option>
              <option value="all">All</option>
            </select>

            <label style={{ marginLeft: '30px' }}><strong>Booking Type:</strong></label>
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
        </div>

        {/* Export Buttons */}
        {data && (
          <div className="text-center mb-4 d-flex flex-wrap justify-content-center gap-3">
            <Button onClick={() =>
              exportToCSV([
                { Metric: 'Tickets Sold', Value: data.ticketsSold },
                { Metric: 'Total Revenue', Value: data.totalRevenue },
                { Metric: 'Top Venue', Value: data.topVenue }
              ], 'metric-summary')}>Export Summary CSV</Button>
            <Button onClick={() => exportToCSV(data.venueUsage, 'venue-usage')}>Export Venue Usage CSV</Button>
            <Button onClick={() => exportToCSV(data.revenueTrend, 'revenue-trend')}>Export Revenue Trend CSV</Button>
            <Button onClick={() => exportToCSV(data.ticketType, 'ticket-types')}>Export Ticket Types CSV</Button>
            <Button variant="dark" onClick={exportPDF}>Export Full Page PDF</Button>
          </div>
        )}

        {/* Metric Charts */}
        {data && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
              <MetricBox title="Tickets Sold" value={data.ticketsSold} />
              <MetricBox title="Total Revenue" value={`EGP ${data.totalRevenue?.toLocaleString() ?? '—'}`} />
              <MetricBox title="Top Venue" value={data.topVenue || '—'} />
            </div>

            <h3 style={sectionHeader}>Venue Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.venueUsage}
                onClick={(e) => {
                  if (e?.activeLabel) setSelectedVenue(e.activeLabel);
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#623E2A" />
              </BarChart>
            </ResponsiveContainer>

            <h3 style={sectionHeader}>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#A1866F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>

            <h3 style={sectionHeader}>Ticket Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.ticketType} dataKey="value" nameKey="type" outerRadius={100} label>
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
