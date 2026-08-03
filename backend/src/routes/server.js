const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Game server configuration
const GAME_SERVER_PATH = 'C:\\Users\\tylerjgoodhue\\Documents\\Azerothcore\\Build\\bin\\RelWithDebInfo';
const GAME_SERVER_EXECUTABLE = 'worldserver.exe';
const AUTH_SERVER_EXECUTABLE = 'authserver.exe';
const LOG_PATH = 'C:\\Users\\tylerjgoodhue\\Documents\\Azerothcore\\Build\\bin\\RelWithDebInfo';

// Check if game server is running (by checking port)
router.get('/status', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    
    // Check if port 8085 is open (game server default port)
    exec('netstat -ano | findstr :8085', (error, stdout) => {
      const isRunning = stdout.includes('LISTENING');
      
      res.json({
        success: true,
        isRunning,
        port: 8085,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check server status' });
  }
});

// Get game server logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, type = 'error', file } = req.query;
    
    let logFile;
    
    // Handle custom log file selection
    if (file && type === 'custom') {
      logFile = path.join(LOG_PATH, file);
    } else {
      // Update to use .txt files instead of .log files
      switch (type) {
        case 'error':
          logFile = path.join(LOG_PATH, 'errors.txt');
          break;
        case 'auth':
          logFile = path.join(LOG_PATH, 'auth.txt');
          break;
        case 'world':
          logFile = path.join(LOG_PATH, 'server.txt'); // Main server log
          break;
        case 'gm':
          logFile = path.join(LOG_PATH, 'server.txt'); // GM commands might be in server.txt
          break;
        default:
          logFile = path.join(LOG_PATH, 'server.txt');
      }
    }
    
    // Try to read the log file
    try {
      const logContent = await fs.readFile(logFile, 'utf8');
      
      // Parse log lines and get last N lines
      const lines = logContent.split('\n').filter(line => line.trim());
      const recentLines = lines.slice(-parseInt(limit));
      
      // Filter for error/warning lines if requested
      const filteredLines = type === 'error' && !file
        ? recentLines.filter(line => 
            line.toLowerCase().includes('error') || 
            line.toLowerCase().includes('warning') ||
            line.toLowerCase().includes('exception') ||
            line.toLowerCase().includes('failed')
          )
        : recentLines;
      
      res.json({
        success: true,
        logs: filteredLines,
        totalLines: lines.length,
        type,
        logFile: path.basename(logFile),
        timestamp: new Date().toISOString()
      });
    } catch (readError) {
      // If log file doesn't exist, return empty logs
      res.json({
        success: true,
        logs: [],
        totalLines: 0,
        type,
        logFile: path.basename(logFile),
        timestamp: new Date().toISOString(),
        note: `Log file not found at: ${logFile}` 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to read logs' });
  }
});

// Start game server
router.post('/start', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    
    // Use full path to executable
    const executablePath = path.join(GAME_SERVER_PATH, GAME_SERVER_EXECUTABLE);
    const startCommand = `"${executablePath}"`;
    
    exec(startCommand, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to start server:', error);
        res.status(500).json({ success: false, error: 'Failed to start server: ' + error.message });
        return;
      }
      
      res.json({
        success: true,
        message: 'Server start command executed',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start server: ' + error.message });
  }
});

// Stop game server
router.post('/stop', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    
    // Kill the game server process by name
    exec(`taskkill /F /IM ${GAME_SERVER_EXECUTABLE}`, (error, stdout, stderr) => {
      if (error && !error.message.includes('not found')) {
        console.error('Failed to stop server:', error);
        res.status(500).json({ success: false, error: 'Failed to stop server' });
        return;
      }
      
      res.json({
        success: true,
        message: 'Server stop command executed',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to stop server' });
  }
});

// Restart game server
router.post('/restart', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    
    // First stop the server
    exec(`taskkill /F /IM ${GAME_SERVER_EXECUTABLE}`, (error) => {
      if (error && !error.message.includes('not found')) {
        console.error('Failed to stop server during restart:', error);
        res.status(500).json({ success: false, error: 'Failed to stop server during restart' });
        return;
      }
      
      // Wait a moment, then start
      setTimeout(() => {
        const executablePath = path.join(GAME_SERVER_PATH, GAME_SERVER_EXECUTABLE);
        const startCommand = `"${executablePath}"`;
        exec(startCommand, (startError) => {
          if (startError) {
            res.status(500).json({ success: false, error: 'Failed to start server during restart' });
            return;
          }
          
          res.json({
            success: true,
            message: 'Server restart command executed',
            timestamp: new Date().toISOString()
          });
        });
      }, 5000); // Wait 5 seconds before starting
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to restart server' });
  }
});

// Get server configuration
router.get('/config', async (req, res) => {
  try {
    // Read the server configuration file
    const configFile = path.join(GAME_SERVER_PATH, 'worldserver.conf');
    const configContent = await fs.readFile(configFile, 'utf8');
    
    res.json({
      success: true,
      config: configContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to read server configuration' });
  }
});

// Get list of available log files
router.get('/log-files', async (req, res) => {
  try {
    const files = await fs.readdir(LOG_PATH);
    const logFiles = files.filter(file => file.endsWith('.txt')); // Filter for .txt files
    
    res.json({
      success: true,
      logFiles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list log files' });
  }
});

module.exports = router;