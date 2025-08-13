import React, { useEffect, useState } from 'react';
 
export default function App() {
  const [events, setEvents] = useState([]);
 
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9092');
 
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'init') {
          setEvents(data.events);
        } else {
          setEvents(prev => [data, ...prev].slice(0, 100));
        }
      } catch {
        // ignore parse errors
      }
    };
 
    ws.onerror = (e) => console.error('WebSocket error', e);
    return () => ws.close();
  }, []);
 
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Self-Healing Locator & AI Test Case Dashboard</h2>
      {events.length === 0 && <div>No events yet. Run tests to see fixes live.</div>}
 
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #ddd',
            margin: '10px 0',
            padding: 10,
            borderRadius: 6,
            backgroundColor: e.type === 'locatorFix'
              ? e.status === 'fixed'
                ? '#e0ffe0'
                : '#ffe0e0'
              : '#e0f0ff'
          }}
        >
          {e.type === 'locatorFix' ? (
            <>
              <div>
                <strong>{e.locatorKey}</strong>{' '}
                <small style={{ color: '#666' }}>
                  {new Date(e.time || Date.now()).toLocaleString()}
                </small>
              </div>
              <div><strong>Old:</strong> <code>{e.oldLocator}</code></div>
              <div><strong>New:</strong> <code>{e.newLocator || '—'}</code></div>
              <div style={{ marginTop: 6, color: e.status === 'fixed' ? 'green' : 'red' }}>
                {e.status === 'fixed' ? 'Fixed' : e.status}
              </div>
              {e.error && (
                <div style={{ color: 'red', marginTop: 4 }}>
                  <strong>Error:</strong> {e.error}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <strong>Generated Test Cases</strong>{' '}
                <small style={{ color: '#666' }}>
                  {new Date(e.time || Date.now()).toLocaleString()}
                </small>
              </div>
              <div><strong>Description:</strong> {e.description}</div>
              <div><strong>URL:</strong> {e.url}</div>
              <pre style={{ background: '#f0f0f0', padding: 10 }}>{e.testCases}</pre>
            </>
          )}
        </div>
      ))}
    </div>
  );
}