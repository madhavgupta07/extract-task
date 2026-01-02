import React, { useState } from 'react';
import API_URL from '../config/api';

export default function DailyView({ user, onUpdate, deviceId }) {
    const [step, setStep] = useState('question'); // 'question' | 'reason'
    const [didIt, setDidIt] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChoice = (answer) => {
        setDidIt(answer);
        setStep('reason');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/habit/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    completed: didIt,
                    reason
                })
            });
            const data = await response.json();
            onUpdate(data);
        } catch (err) {
            alert('Error saving log');
        } finally {
            setLoading(false);
        }
    };

    // Guard: if user data is not ready
    if (!user || !user.habit) {
        return <div className="card">Loading...</div>;
    }

    return (
        <div className="card animate-fade-in">
            {step === 'question' ? (
                <>
                    <h1>Day {user.dayNumber || '?'}</h1>
                    <p className="subtitle">Min: {user.habit.minVersion}</p>
                    <h2>Did you actually do this today?</h2>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="btn-choice btn-yes" onClick={() => handleChoice(true)}>Yes</button>
                        <button className="btn-choice btn-no" onClick={() => handleChoice(false)}>No</button>
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h2>{didIt ? 'Great.' : 'Honesty is key.'}</h2>

                    <div className="input-group">
                        <label>
                            {didIt ? 'What helped you do it today?' : 'What stopped you today?'}
                        </label>
                        <input
                            type="text"
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Short answer..."
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading || !reason}>
                        {loading ? 'Saving...' : 'Done'}
                    </button>
                </form>
            )}
        </div>
    );
}
