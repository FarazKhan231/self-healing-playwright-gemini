import React, { useEffect, useState } from 'react';

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9091');
    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data);
        setEvents((prev) => [event, ...prev].slice(0, 100));
      } catch {
        // ignore JSON parse errors
      }
    };
    ws.onerror = (e) => console.error('WebSocket error', e);
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Self-Healing Locator Dashboard</h2>
      {events.length === 0 && <div>No events yet. Run tests to see fixes live.</div>}
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #ddd',
            margin: '10px 0',
            padding: 10,
            borderRadius: 6,
            backgroundColor: e.status === 'fixed' ? '#e0ffe0' : '#ffe0e0'
          }}
        >
          <div>
            <strong>{e.locatorKey}</strong>{' '}
            <small style={{ color: '#666' }}>{new Date(e.time || Date.now()).toLocaleString()}</small>
          </div>
          <div>
            <strong>Old:</strong> <code>{e.oldLocator}</code>
          </div>
          <div>
            <strong>New:</strong> <code>{e.newLocator || '—'}</code>
          </div>
          <div style={{ marginTop: 6, color: e.status === 'fixed' ? 'green' : 'red' }}>
            {e.status === 'fixed' ? 'Fixed' : e.status}
          </div>
          {e.error && (
            <div style={{ color: 'red', marginTop: 4 }}>
              <strong>Error:</strong> {e.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
