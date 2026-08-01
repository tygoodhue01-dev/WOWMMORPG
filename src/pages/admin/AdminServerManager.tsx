import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminServerManager() {
  const [serverStatus, setServerStatus] = useState({ isRunning: false, loading: true });
  const [logs, setLogs] = useState([]);
  const [logType, setLogType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch server status
  const fetchServerStatus = async () => {
    try {
      const response = await fetch('/api/server/status');
      const data = await response.json();
      setServerStatus({ ...data, loading: false });
    } catch (error) {
      console.error('Failed to fetch server status:', error);
      setServerStatus({ isRunning: false, loading: false });
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/server/logs?type=${logType}&limit=50`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Server control actions
  const startServer = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/server/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setTimeout(fetchServerStatus, 3000); // Check status after 3 seconds
      }
    } catch (error) {
      console.error('Failed to start server:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const stopServer = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/server/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setTimeout(fetchServerStatus, 2000); // Check status after 2 seconds
      }
    } catch (error) {
      console.error('Failed to stop server:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const restartServer = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/server/restart', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setTimeout(fetchServerStatus, 5000); // Check status after 5 seconds
      }
    } catch (error) {
      console.error('Failed to restart server:', error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    fetchLogs();
    const interval = setInterval(fetchServerStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '8px 16px',
              background: 'rgba(212, 175, 55, 0.1)',
              color: '#d4af37',
              border: '1px solid #d4af37',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back to Admin Panel
          </button>
          
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
            🖥️ Server Manager
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Manage your AzerothCore game server
          </p>
        </div>

        {/* Server Status Card */}
        <div style={{ 
          marginBottom: '32px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                Server Status
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: serverStatus.isRunning ? '#4ade80' : '#ef4444',
                  animation: serverStatus.isRunning ? 'pulse 2s infinite' : 'none'
                }} />
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: serverStatus.isRunning ? '#4ade80' : '#ef4444'
                }}>
                  {serverStatus.loading ? 'Checking...' : serverStatus.isRunning ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <button
              onClick={fetchServerStatus}
              style={{
                padding: '8px 16px',
                background: 'rgba(212, 175, 55, 0.1)',
                color: '#d4af37',
                border: '1px solid #d4af37',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>

          {/* Server Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={startServer}
              disabled={actionLoading || serverStatus.isRunning}
              style={{
                padding: '12px 24px',
                background: serverStatus.isRunning ? 'rgba(74, 222, 128, 0.2)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: serverStatus.isRunning ? '#4ade80' : '#0f0f10',
                border: '1px solid #4ade80',
                borderRadius: '8px',
                cursor: serverStatus.isRunning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: serverStatus.isRunning ? 0.5 : 1
              }}
            >
              {actionLoading ? 'Processing...' : '▶️ Start Server'}
            </button>
            
            <button
              onClick={stopServer}
              disabled={actionLoading || !serverStatus.isRunning}
              style={{
                padding: '12px 24px',
                background: !serverStatus.isRunning ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: !serverStatus.isRunning ? '#ef4444' : '#0f0f10',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                cursor: !serverStatus.isRunning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: !serverStatus.isRunning ? 0.5 : 1
              }}
            >
              {actionLoading ? 'Processing...' : '⏹️ Stop Server'}
            </button>
            
            <button
              onClick={restartServer}
              disabled={actionLoading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#0f0f10',
                border: '1px solid #f97316',
                borderRadius: '8px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.5 : 1
              }}
            >
              {actionLoading ? 'Processing...' : '🔄 Restart Server'}
            </button>
          </div>
        </div>

        {/* Logs Section */}
        <div style={{ 
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
              📜 Server Logs
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setLogType('error')}
                style={{
                  padding: '8px 16px',
                  background: logType === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  color: logType === 'error' ? '#ef4444' : '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Errors
              </button>
              <button
                onClick={() => setLogType('auth')}
                style={{
                  padding: '8px 16px',
                  background: logType === 'auth' ? 'rgba(168, 142, 222, 0.2)' : 'rgba(168, 142, 222, 0.1)',
                  color: logType === 'auth' ? '#a896de' : '#a896de',
                  border: '1px solid #a896de',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Auth
              </button>
              <button
                onClick={() => setLogType('world')}
                style={{
                  padding: '8px 16px',
                  background: logType === 'world' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)',
                  color: logType === 'world' ? '#4ade80' : '#4ade80',
                  border: '1px solid #4ade80',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                World
              </button>
              <button
                onClick={fetchLogs}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Refresh Logs
              </button>
            </div>
          </div>

          {/* Log Display */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            {loading ? (
              <div style={{ color: '#a0a0a0' }}>Loading logs...</div>
            ) : logs.length === 0 ? (
              <div style={{ color: '#a0a0a0' }}>No logs available</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '4px',
                  color: log.toLowerCase().includes('error') ? '#ef4444' : 
                        log.toLowerCase().includes('warning') ? '#f97316' : '#a0a0a0',
                  whiteSpace: 'pre-wrap'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}