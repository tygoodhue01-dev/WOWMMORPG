const express = require('express');
const {
  createGameAccount,
  getUserGameAccounts,
  deleteGameAccount,
  syncPassword
} = require('../services/accountSync.js');

const router = express.Router();

// Create game account
router.post('/create', async (req, res) => {
  try {
    const { userId, accountName, password, expansion } = req.body;

    console.log('🎮 Game account creation request received:');
    console.log('   User ID:', userId);
    console.log('   Account Name:', accountName);
    console.log('   Expansion:', expansion);
    console.log('   Password provided:', !!password);

    if (!userId || !accountName || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: userId, accountName, password' 
      });
    }

    console.log('✅ All required fields present, calling createGameAccount...');
    const result = await createGameAccount(userId, accountName, password, expansion);
    
    console.log('🎯 Game account creation result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating game account:', error);
    res.status(500).json({ error: 'Failed to create game account' });
  }
});

// Get user's game accounts
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getUserGameAccounts(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching game accounts:', error);
    res.status(500).json({ error: 'Failed to fetch game accounts' });
  }
});

// Delete game account
router.delete('/:userId/:accountName', async (req, res) => {
  try {
    const { userId, accountName } = req.params;
    const result = await deleteGameAccount(userId, accountName);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error deleting game account:', error);
    res.status(500).json({ error: 'Failed to delete game account' });
  }
});

// Sync password to game accounts
router.post('/sync-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, newPassword' 
      });
    }

    const result = await syncPassword(userId, newPassword);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error syncing password:', error);
    res.status(500).json({ error: 'Failed to sync password' });
  }
});

module.exports = router;