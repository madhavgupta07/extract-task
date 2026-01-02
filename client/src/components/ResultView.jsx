import React, { useEffect, useState } from 'react';

// API URL - uses environment variable in production, empty for same-domain deployment
const API_URL = import.meta.env.VITE_API_URL || '';
export default function ResultView({ deviceId, onRestart }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/habit/summary?deviceId=${deviceId}`)
            .then(res => res.json())
            .then(setData);
    }, [deviceId]);

    if (!data) return <div className="card">Loading...</div>;

    return (
        <div className="card animate-fade-in">
            <h1>7 Days Complete</h1>

            <div className="stat-box">
                <span className="big-number">
                    {data.completedDays} / {data.totalDays}
                </span>
                <p>Days Completed</p>
            </div>

            <div className="input-group" style={{ textAlign: 'center' }}>
                <label>Reality Check Insight</label>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '10px' }}>
                    {data.insight}
                </p>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                <label>History</label>
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#495057' }}>
                    {data.logs.map((log, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>
                            {new Date(log.date).toLocaleDateString()}: <strong>{log.completed ? 'Yes' : 'No'}</strong> - {log.reason}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="btn-primary" onClick={onRestart} style={{ marginTop: '2rem' }}>
                New 7-Day Block
            </button>
        </div>
    );
}
