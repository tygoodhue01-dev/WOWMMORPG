import express from 'express';
import { triggerRealmUpdate } from '../services/realmStatus.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get current realm status (from Supabase)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('realms').select('*').order('display_order');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error getting realms:', error);
    res.status(500).json({ error: 'Failed to get realms' });
  }
});

// Get current realm status (from Supabase)
router.get('/status', async (req, res) => {
  try {
    // This would normally query Supabase, but for now trigger an update
    const result = await triggerRealmUpdate();
    res.json(result);
  } catch (error) {
    console.error('Error getting realm status:', error);
    res.status(500).json({ error: 'Failed to get realm status' });
  }
});

// Force update realm status from game server
router.post('/update', async (req, res) => {
  try {
    const result = await triggerRealmUpdate();
    res.json(result);
  } catch (error) {
    console.error('Error updating realm status:', error);
    res.status(500).json({ error: 'Failed to update realm status' });
  }
});

export default router;