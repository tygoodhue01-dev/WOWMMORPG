const express = require('express');
const { getCharacters, getCharacterStats } = require('../services/characters.js');

const router = express.Router();

// Get characters for a game account
router.get('/:accountName', async (req, res) => {
  try {
    const { accountName } = req.params;
    const result = await getCharacters(accountName);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get character statistics
router.get('/:accountName/stats', async (req, res) => {
  try {
    const { accountName } = req.params;
    const result = await getCharacterStats(accountName);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching character stats:', error);
    res.status(500).json({ error: 'Failed to fetch character stats' });
  }
});

module.exports = router;