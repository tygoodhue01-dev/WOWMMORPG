const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const realmRoutes = require('./routes/realms.js');
const accountRoutes = require('./routes/accounts.js');
const characterRoutes = require('./routes/characters.js');
const serverRoutes = require('./routes/server.js');
const leaderboardRoutes = require('./routes/leaderboards.js');
const armoryRoutes = require('./routes/armory.js');
const itemRoutes = require('./routes/items.js');
const guildRoutes = require('./routes/guilds.js');
const { startRealmStatusPolling } = require('./services/realmStatus.js');

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
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/armory', armoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/guilds', guildRoutes);

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