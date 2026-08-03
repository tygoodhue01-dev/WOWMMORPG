const express = require('express');
const { gameDbPool } = require('../config/database.js');

const router = express.Router();

// Get PvP arena rankings
router.get('/pvp', async (req, res) => {
  try {
    const { limit = 50, faction } = req.query;
    
    let query = `
      SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        ca.rating,
        ca.weekly_wins,
        ca.weekly_losses,
        ca.season_wins,
        ca.season_losses,
        ca.match_count,
        c.logout_time
      FROM characters c
      LEFT JOIN character_arena_stats ca ON c.guid = ca.guid
      WHERE c.level >= 70
    `;
    
    const params = [];
    
    if (faction) {
      query += ` AND c.race IN (SELECT id FROM chr_races WHERE faction = ?)`;
      params.push(faction);
    }
    
    query += ` ORDER BY ca.rating DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [characters] = await gameDbPool.query(query, params);
    
    // Calculate win rates
    const leaderboard = characters.map(char => {
      const totalMatches = (char.weekly_wins || 0) + (char.weekly_losses || 0);
      const winRate = totalMatches > 0 ? ((char.weekly_wins || 0) / totalMatches * 100).toFixed(1) : 0;
      
      return {
        guid: char.guid,
        name: char.name,
        race: char.race,
        class: char.class,
        level: char.level,
        gender: char.gender,
        rating: char.rating || 0,
        weeklyWins: char.weekly_wins || 0,
        weeklyLosses: char.weekly_losses || 0,
        seasonWins: char.season_wins || 0,
        seasonLosses: char.season_losses || 0,
        matchCount: char.match_count || 0,
        winRate: parseFloat(winRate),
        lastSeen: char.logout_time
      };
    });
    
    res.json({
      success: true,
      leaderboard,
      type: 'pvp',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch PvP leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch PvP leaderboard' });
  }
});

// Get PvE progression rankings
router.get('/pve', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Query for high-level characters with play time
    const query = `
      SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        c.totaltime,
        c.logout_time,
        c.guildid,
        g.name as guild_name
      FROM characters c
      LEFT JOIN guild_member gm ON c.guid = gm.guid
      LEFT JOIN guild g ON gm.guildid = g.guildid
      WHERE c.level >= 70
      ORDER BY c.totaltime DESC
      LIMIT ?
    `;
    
    const [characters] = await gameDbPool.query(query, [parseInt(limit)]);
    
    const leaderboard = characters.map(char => {
      // Convert totaltime from seconds to hours
      const totalHours = (char.totaltime / 3600).toFixed(1);
      
      return {
        guid: char.guid,
        name: char.name,
        race: char.race,
        class: char.class,
        level: char.level,
        gender: char.gender,
        totalHours: parseFloat(totalHours),
        guildId: char.guildid,
        guildName: char.guild_name,
        lastSeen: char.logout_time
      };
    });
    
    res.json({
      success: true,
      leaderboard,
      type: 'pve',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch PvE leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch PvE leaderboard' });
  }
});

// Get achievement leaders
router.get('/achievements', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const query = `
      SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        COUNT(ca.id) as achievement_count
      FROM characters c
      LEFT JOIN character_achievement ca ON c.guid = ca.guid
      WHERE c.level >= 70
      GROUP BY c.guid, c.name, c.race, c.class, c.level
      ORDER BY achievement_count DESC
      LIMIT ?
    `;
    
    const [characters] = await gameDbPool.query(query, [parseInt(limit)]);
    
    const leaderboard = characters.map(char => ({
      guid: char.guid,
      name: char.name,
      race: char.race,
      class: char.class,
      level: char.level,
      achievementCount: char.achievement_count
    }));
    
    res.json({
      success: true,
      leaderboard,
      type: 'achievements',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch achievement leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch achievement leaderboard' });
  }
});

// Get guild rankings
router.get('/guilds', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const query = `
      SELECT 
        g.guildid,
        g.name,
        g.leaderguid,
        g.motd,
        g.createdate,
        COUNT(gm.guid) as member_count,
        AVG(c.level) as average_level
      FROM guild g
      LEFT JOIN guild_member gm ON g.guildid = gm.guildid
      LEFT JOIN characters c ON gm.guid = c.guid
      GROUP BY g.guildid, g.name, g.leaderguid, g.motd, g.createdate
      HAVING member_count >= 1
      ORDER BY member_count DESC, average_level DESC
      LIMIT ?
    `;
    
    const [guilds] = await gameDbPool.query(query, [parseInt(limit)]);
    
    const leaderboard = guilds.map(guild => ({
      guildId: guild.guildid,
      name: guild.name,
      leaderGuid: guild.leaderguid,
      motd: guild.motd,
      createdDate: guild.createdate,
      memberCount: guild.member_count,
      averageLevel: guild.average_level ? parseFloat(guild.average_level.toFixed(1)) : 0
    }));
    
    res.json({
      success: true,
      leaderboard,
      type: 'guilds',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild leaderboard' });
  }
});

// Get rich characters (by gold)
router.get('/wealth', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const query = `
      SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.money
      FROM characters c
      WHERE c.level >= 70
      ORDER BY c.money DESC
      LIMIT ?
    `;
    
    const [characters] = await gameDbPool.query(query, [parseInt(limit)]);
    
    const leaderboard = characters.map(char => {
      // Convert money from copper to gold/silver/copper
      const copper = char.money;
      const gold = Math.floor(copper / 10000);
      const silver = Math.floor((copper % 10000) / 100);
      const copperRemainder = copper % 100;
      
      return {
        guid: char.guid,
        name: char.name,
        race: char.race,
        class: char.class,
        level: char.level,
        gold,
        silver,
        copper: copperRemainder,
        totalMoney: char.money
      };
    });
    
    res.json({
      success: true,
      leaderboard,
      type: 'wealth',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch wealth leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wealth leaderboard' });
  }
});

// Get all leaderboard types summary
router.get('/summary', async (req, res) => {
  try {
    // Get counts for each category
    const [totalCharacters] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM characters WHERE level >= 70'
    );
    
    const [totalGuilds] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM guild'
    );
    
    const [totalAchievements] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM character_achievement'
    );
    
    res.json({
      success: true,
      summary: {
        totalCharacters: totalCharacters[0].count,
        totalGuilds: totalGuilds[0].count,
        totalAchievements: totalAchievements[0].count
      },
      categories: [
        { type: 'pvp', name: 'PvP Arena', description: 'Arena ratings and statistics' },
        { type: 'pve', name: 'PvE Progression', description: 'Play time and progression' },
        { type: 'achievements', name: 'Achievements', description: 'Most achievements completed' },
        { type: 'guilds', name: 'Guilds', description: 'Largest and most active guilds' },
        { type: 'wealth', name: 'Wealth', description: 'Richest characters' }
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard summary' });
  }
});

module.exports = router;