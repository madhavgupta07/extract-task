import React, { useState } from 'react';

// API URL - uses environment variable in production, empty for same-domain deployment
const API_URL = import.meta.env.VITE_API_URL || '';

const habits = ['Sleep', 'Walk', 'Water', 'Read', 'Meditate'];

export default function SetupView({ onStart, deviceId }) {
    const [selectedHabit, setSelectedHabit] = useState('');
    const [minVersion, setMinVersion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHabit || !minVersion) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/habit/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    habitName: selectedHabit,
                    minVersion
                })
            });
            const data = await response.json();
            onStart(data);
        } catch (err) {
            alert('Error starting habit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in">
            <h1>Daily Reality Check</h1>
            <p className="subtitle">Commit to ONE small daily action for 7 days.</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>1. Choose one habit</label>
                    <div className="habit-buttons">
                        {habits.map(h => (
                            <button
                                key={h}
                                type="button"
                                className={`habit-btn ${selectedHabit === h ? 'active' : ''}`}
                                onClick={() => setSelectedHabit(h)}
                            >
                                {h}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`habit-btn ${selectedHabit === 'Custom' ? 'active' : ''}`}
                            onClick={() => setSelectedHabit('Custom')}
                        >
                            Custom
                        </button>
                    </div>
                    {selectedHabit === 'Custom' && (
                        <input
                            type="text"
                            placeholder="e.g. Floss teeth"
                            onChange={(e) => setSelectedHabit(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                    )}
                </div>

                <div className="input-group">
                    <label>2. Set a tiny minimum version</label>
                    <input
                        type="text"
                        placeholder="e.g. Walk 5 minutes"
                        value={minVersion}
                        onChange={(e) => setMinVersion(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading || !selectedHabit || !minVersion}>
                    {loading ? 'Starting...' : 'Begin 7 Days'}
                </button>
            </form>

            <div className="reflection-text">
                <p>"Consistency is harder than intensity."</p>
            </div>
        </div>
    );
}
