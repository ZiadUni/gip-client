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
  const today = new Date();
  const oneWeekBefore = new Date(today);
  oneWeekBefore.setDate(today.getDate() - 7);
  const oneWeekAfter = new Date(today);
  oneWeekAfter.setDate(today.getDate() + 7);
  const [startDate, setStartDate] = useState(oneWeekBefore.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(oneWeekAfter.toISOString().split('T')[0]);

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('current');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [refreshTimer, setRefreshTimer] = useState(0);
  const pageRef = useRef();

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
    fetchData();
  }, [startDate, endDate, typeFilter, statusFilter, selectedVenue]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const tick = setInterval(() => {
      setRefreshTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(tick);
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
    const original = pageRef.current;
    const clone = original.cloneNode(true);
    clone.style.padding = '40px';
    clone.style.backgroundColor = '#ffffff';
    clone.style.maxWidth = '1000px';
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    document.body.appendChild(clone);
    html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('metrics-dashboard.pdf');
      document.body.removeChild(clone);
    });
  };

  return (
    <div className="fade-in" ref={pageRef}>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>📊 Innovation Park Analytics Dashboard</h2>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {!data && !error && <p className="text-center mt-4">Loading metrics...</p>}

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

        <h5 className="text-center">🕒 Time Range Filter</h5>
        <div className="text-center mb-3">
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
        </div>

        <h5 className="text-center">📋 Booking Filters</h5>
        <div className="text-center mb-4">
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

        <h5 className="text-center">📁 Export Options</h5>
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

        {/* Summary Boxes */}
        {/* VENUE METRICS */}
        <h4 className="text-center mt-4">📍 Venue Metrics</h4>
        <div style={grid}>
          <MetricBox title="Total Venues Used" value={data?.venueUsage?.length || 0} />
          <MetricBox title="Most Used Venue" value={data?.topVenue || '—'} />
          <MetricBox
            title="Avg Bookings per Venue"
            value={Math.round((data?.ticketsSold || 0) / (data?.venueUsage?.length || 1))}
          />
        </div>

        {/* TICKET METRICS */}
        <h4 className="text-center mt-4">🎟 Ticket Metrics</h4>
        <div style={grid}>
          <MetricBox
            title="Confirmed"
            value={data?.ticketType?.find(t => t.type === 'Confirmed')?.value || 0}
          />
          <MetricBox
            title="Pending"
            value={data?.ticketType?.find(t => t.type === 'Pending')?.value || 0}
          />
          <MetricBox
            title="Cancelled"
            value={data?.ticketType?.find(t => t.type === 'Cancelled')?.value || 0}
          />
        </div>

        {/* OVERALL METRICS */}
        <h4 className="text-center mt-4">📊 Overall Metrics</h4>
        <div style={grid}>
          <MetricBox title="Tickets Sold" value={data?.ticketsSold || 0} />
          <MetricBox
            title="Total Revenue"
            value={`EGP ${data?.totalRevenue?.toLocaleString() || '0'}`}
          />
          <MetricBox
            title="Revenue per Ticket"
            value={`EGP ${Math.round((data?.totalRevenue || 0) / (data?.ticketsSold || 1))}`}
          />
        </div>



        {/* Venue Usage Chart */}
        <h3 style={sectionHeader}>📍 Venue Usage</h3>
        {data?.venueUsage?.length === 0 ? (
          <p className="text-center text-muted">No venue usage data for this range.</p>
        ) : data?.venueUsage?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.venueUsage}
              onClick={(e) => {
                if (e?.activeLabel) setSelectedVenue(e.activeLabel);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#623E2A" />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {/* Revenue Trend Chart */}
        <h3 style={sectionHeader}>📈 Revenue Over Time</h3>
        {data?.revenueTrend?.length === 0 ? (
          <p className="text-center text-muted">No revenue data for this range.</p>
        ) : data?.revenueTrend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.revenueTrend}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Revenue (EGP)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#A1866F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}

        {/* Ticket Types Chart */}
        <h3 style={sectionHeader}>🥧 Ticket Types</h3>
        {data?.ticketType?.length === 0 ? (
          <p className="text-center text-muted">No ticket data available for this range.</p>
        ) : data?.ticketType?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.ticketType}
                dataKey="value"
                nameKey="type"
                outerRadius={100}
                label={({ type, percent, value }) =>
                  `${type}: ${(percent * 100).toFixed(1)}% (${value})`
                }
              >
                {(data?.ticketType ?? []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : null}

        {/* Clear Drilldown Button */}
        {selectedVenue && (
          <div className="text-center mt-3">
            <Button variant="secondary" onClick={() => setSelectedVenue(null)}>
              Clear Drilldown: {selectedVenue}
            </Button>
          </div>
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

const grid = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '40px'
};

export default Metrics;
