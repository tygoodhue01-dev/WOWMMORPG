const express = require('express');
const { gameDbPool } = require('../config/database.js');

const router = express.Router();

// Get all guilds with search and filters
router.get('/list', async (req, res) => {
  try {
    const { query, minMembers = 1, minLevel = 1, limit = 50 } = req.query;
    
    let sql = `
      SELECT 
        g.guildid,
        g.name,
        g.leaderguid,
        g.motd,
        g.createdate,
        g.info,
        COUNT(gm.guid) as member_count,
        AVG(c.level) as average_level,
        MAX(c.level) as max_level,
        MIN(c.level) as min_level,
        SUM(c.totaltime) as total_playtime
      FROM guild g
      LEFT JOIN guild_member gm ON g.guildid = gm.guildid
      LEFT JOIN characters c ON gm.guid = c.guid
      WHERE 1=1
    `;
    
    const params = [];
    
    if (query) {
      sql += ` AND g.name LIKE ?`;
      params.push(`%${query}%`);
    }
    
    sql += ` GROUP BY g.guildid, g.name, g.leaderguid, g.motd, g.createdate, g.info`;
    
    if (minMembers) {
      sql += ` HAVING member_count >= ?`;
      params.push(parseInt(minMembers));
    }
    
    if (minLevel) {
      sql += ` AND average_level >= ?`;
      params.push(parseInt(minLevel));
    }
    
    sql += ` ORDER BY member_count DESC, average_level DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [guilds] = await gameDbPool.query(sql, params);
    
    const formattedGuilds = guilds.map(guild => ({
      guildId: guild.guildid,
      name: guild.name,
      leaderGuid: guild.leaderguid,
      motd: guild.motd,
      info: guild.info,
      createdDate: guild.createdate,
      memberCount: guild.member_count,
      averageLevel: guild.average_level ? parseFloat(guild.average_level.toFixed(1)) : 0,
      maxLevel: guild.max_level,
      minLevel: guild.min_level,
      totalPlaytime: guild.total_playtime ? (guild.total_playtime / 3600).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      guilds: formattedGuilds,
      count: formattedGuilds.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild list' });
  }
});

// Get detailed guild information
router.get('/guild/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Get guild basic info
    const [guilds] = await gameDbPool.query(
      `SELECT 
        g.guildid,
        g.name,
        g.leaderguid,
        g.motd,
        g.createdate,
        g.info,
        g.emblemStyle,
        g.emblemColor,
        g.borderStyle,
        g.borderColor,
        g.backgroundColor
      FROM guild g
      WHERE g.guildid = ?`,
      [guildId]
    );
    
    if (guilds.length === 0) {
      return res.status(404).json({ success: false, error: 'Guild not found' });
    }
    
    const guild = guilds[0];
    
    // Get guild leader info
    const [leader] = await gameDbPool.query(
      `SELECT name, race, class, level FROM characters WHERE guid = ?`,
      [guild.leaderguid]
    );
    
    // Get guild members with ranks
    const [members] = await gameDbPool.query(
      `SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        c.logout_time,
        c.totaltime,
        gm.rank,
        gm.pnote,
        gm.offnote
      FROM guild_member gm
      LEFT JOIN characters c ON gm.guid = c.guid
      WHERE gm.guildid = ?
      ORDER BY gm.rank ASC, c.level DESC`,
      [guildId]
    );
    
    // Get guild rank names
    const [ranks] = await gameDbPool.query(
      `SELECT rid, rname, rights FROM guild_rank WHERE guildid = ? ORDER BY rid ASC`,
      [guildId]
    );
    
    // Get guild statistics
    const [stats] = await gameDbPool.query(
      `SELECT 
        COUNT(*) as total_members,
        AVG(c.level) as average_level,
        MAX(c.level) as max_level,
        MIN(c.level) as min_level,
        SUM(c.totaltime) as total_playtime,
        COUNT(CASE WHEN c.level >= 70 THEN 1 END) as max_level_characters
      FROM guild_member gm
      LEFT JOIN characters c ON gm.guid = c.guid
      WHERE gm.guildid = ?`,
      [guildId]
    );
    
    const formattedGuild = {
      basic: {
        guildId: guild.guildid,
        name: guild.name,
        leaderGuid: guild.leaderguid,
        leader: leader[0] || null,
        motd: guild.motd,
        info: guild.info,
        createdDate: guild.createdate,
        emblem: {
          style: guild.emblemStyle,
          color: guild.emblemColor,
          borderStyle: guild.borderStyle,
          borderColor: guild.borderColor,
          backgroundColor: guild.backgroundColor
        }
      },
      members: members.map(member => ({
        guid: member.guid,
        name: member.name,
        race: member.race,
        class: member.class,
        level: member.level,
        gender: member.gender,
        lastSeen: member.logout_time,
        totalHours: (member.totaltime / 3600).toFixed(1),
        rank: member.rank,
        publicNote: member.pnote,
        officerNote: member.offnote
      })),
      ranks: ranks.map(rank => ({
        id: rank.rid,
        name: rank.rname,
        rights: rank.rights
      })),
      statistics: {
        totalMembers: stats[0].total_members,
        averageLevel: stats[0].average_level ? parseFloat(stats[0].average_level.toFixed(1)) : 0,
        maxLevel: stats[0].max_level,
        minLevel: stats[0].min_level,
        totalPlaytime: stats[0].total_playtime ? (stats[0].total_playtime / 3600).toFixed(1) : 0,
        maxLevelCharacters: stats[0].max_level_characters
      }
    };
    
    res.json({
      success: true,
      guild: formattedGuild,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild details' });
  }
});

// Get guild leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'members', limit = 20 } = req.query;
    
    let sql = '';
    const params = [];
    
    switch (type) {
      case 'members':
        sql = `
          SELECT 
            g.guildid,
            g.name,
            COUNT(gm.guid) as member_count,
            AVG(c.level) as average_level
          FROM guild g
          LEFT JOIN guild_member gm ON g.guildid = gm.guildid
          LEFT JOIN characters c ON gm.guid = c.guid
          GROUP BY g.guildid, g.name
          HAVING member_count >= 1
          ORDER BY member_count DESC
          LIMIT ?
        `;
        params.push(parseInt(limit));
        break;
        
      case 'average_level':
        sql = `
          SELECT 
            g.guildid,
            g.name,
            COUNT(gm.guid) as member_count,
            AVG(c.level) as average_level
          FROM guild g
          LEFT JOIN guild_member gm ON g.guildid = gm.guildid
          LEFT JOIN characters c ON gm.guid = c.guid
          GROUP BY g.guildid, g.name
          HAVING member_count >= 5
          ORDER BY average_level DESC
          LIMIT ?
        `;
        params.push(parseInt(limit));
        break;
        
      case 'playtime':
        sql = `
          SELECT 
            g.guildid,
            g.name,
            COUNT(gm.guid) as member_count,
            SUM(c.totaltime) as total_playtime
          FROM guild g
          LEFT JOIN guild_member gm ON g.guildid = gm.guildid
          LEFT JOIN characters c ON gm.guid = c.guid
          GROUP BY g.guildid, g.name
          HAVING member_count >= 1
          ORDER BY total_playtime DESC
          LIMIT ?
        `;
        params.push(parseInt(limit));
        break;
        
      default:
        sql = `
          SELECT 
            g.guildid,
            g.name,
            COUNT(gm.guid) as member_count,
            AVG(c.level) as average_level
          FROM guild g
          LEFT JOIN guild_member gm ON g.guildid = gm.guildid
          LEFT JOIN characters c ON gm.guid = c.guid
          GROUP BY g.guildid, g.name
          HAVING member_count >= 1
          ORDER BY member_count DESC
          LIMIT ?
        `;
        params.push(parseInt(limit));
    }
    
    const [guilds] = await gameDbPool.query(sql, params);
    
    const formattedGuilds = guilds.map(guild => ({
      guildId: guild.guildid,
      name: guild.name,
      memberCount: guild.member_count,
      averageLevel: guild.average_level ? parseFloat(guild.average_level.toFixed(1)) : 0,
      totalPlaytime: guild.total_playtime ? (guild.total_playtime / 3600).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      leaderboard: formattedGuilds,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild leaderboard' });
  }
});

// Get guild recruitment summary
router.get('/recruitment', async (req, res) => {
  try {
    const [guilds] = await gameDbPool.query(
      `SELECT 
        g.guildid,
        g.name,
        g.motd,
        g.info,
        COUNT(gm.guid) as member_count,
        AVG(c.level) as average_level
      FROM guild g
      LEFT JOIN guild_member gm ON g.guildid = gm.guildid
      LEFT JOIN characters c ON gm.guid = c.guid
      WHERE g.info IS NOT NULL AND g.info != ''
      GROUP BY g.guildid, g.name, g.motd, g.info
      HAVING member_count >= 1
      ORDER BY member_count DESC
      LIMIT 20`
    );
    
    const formattedGuilds = guilds.map(guild => ({
      guildId: guild.guildid,
      name: guild.name,
      motd: guild.motd,
      info: guild.info,
      memberCount: guild.member_count,
      averageLevel: guild.average_level ? parseFloat(guild.average_level.toFixed(1)) : 0
    }));
    
    res.json({
      success: true,
      guilds: formattedGuilds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild recruitment:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild recruitment' });
  }
});

// Get guild summary statistics
router.get('/summary', async (req, res) => {
  try {
    const [totalGuilds] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM guild'
    );
    
    const [totalMembers] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM guild_member'
    );
    
    const [averageSize] = await gameDbPool.query(
      `SELECT AVG(member_count) as avg_size 
       FROM (SELECT COUNT(*) as member_count FROM guild_member GROUP BY guildid) as sizes`
    );
    
    const [largestGuilds] = await gameDbPool.query(
      `SELECT 
        g.name,
        COUNT(gm.guid) as member_count
      FROM guild g
      LEFT JOIN guild_member gm ON g.guildid = gm.guildid
      GROUP BY g.guildid, g.name
      ORDER BY member_count DESC
      LIMIT 5`
    );
    
    res.json({
      success: true,
      summary: {
        totalGuilds: totalGuilds[0].count,
        totalMembers: totalMembers[0].count,
        averageSize: averageSize[0].avg_size ? parseFloat(averageSize[0].avg_size.toFixed(1)) : 0,
        largestGuilds: largestGuilds
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch guild summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guild summary' });
  }
});

module.exports = router;