import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import realmRoutes from './routes/realms.js';
import accountRoutes from './routes/accounts.js';
import characterRoutes from './routes/characters.js';
import serverRoutes from './routes/server.js';
import { startRealmStatusPolling } from './services/realmStatus.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/realms', realmRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/server', serverRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start realm status polling
startRealmStatusPolling();

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});