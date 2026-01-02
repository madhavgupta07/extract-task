import React, { useState, useEffect } from 'react';
import SetupView from './components/SetupView';
import DailyView from './components/DailyView';
import ResultView from './components/ResultView'; // Corrected import path if needed
import './index.css';

// API URL - uses environment variable in production, empty for same-domain deployment
const API_URL = import.meta.env.VITE_API_URL || '';

// Simple UUID generator
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('drc_device_id'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading'); // loading, setup, active, completed

  useEffect(() => {
    let id = deviceId;
    if (!id) {
      id = uuidv4();
      localStorage.setItem('drc_device_id', id);
      setDeviceId(id);
    }

    // Init User
    fetch(`${API_URL}/api/users/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: id })
    })
      .then(res => res.json())
      .then(u => {
        // Check status immediately
        checkStatus(id);
      });
  }, []);

  const checkStatus = (id = deviceId) => {
    fetch(`${API_URL}/api/habit/status?deviceId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'setup') {
          setStatus('setup');
        } else if (data.status === 'completed') {
          setStatus('completed');
        } else {
          // Active
          // Check if logged today
          if (data.hasLoggedToday) {
            setStatus('done_today');
            setUser(data.user || data.habit); // The API structure might vary slightly, let's fix
            // API returns { status, dayNumber, hasLoggedToday, habit }
            setUser({ ...data, habit: data.habit });
          } else {
            setStatus('active');
            setUser(data);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdate = () => {
    setLoading(true);
    checkStatus();
  };

  const handleRestart = () => {
    // Basic restart: clear habit in UI logic? 
    // Actually the SetupView will just POST /habit/start which overwrites user.habit
    setStatus('setup');
  };

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div id="app-container">
      {status === 'setup' && (
        <SetupView deviceId={deviceId} onStart={handleUpdate} />
      )}

      {status === 'active' && user && (
        <DailyView user={user} deviceId={deviceId} onUpdate={handleUpdate} />
      )}

      {status === 'done_today' && (
        <div className="card animate-fade-in">
          <h1>All done for today.</h1>
          <p className="subtitle">See you tomorrow.</p>
          <div className="reflection-text">
            "Small steps. Every day."
          </div>
        </div>
      )}

      {status === 'completed' && (
        <ResultView deviceId={deviceId} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
