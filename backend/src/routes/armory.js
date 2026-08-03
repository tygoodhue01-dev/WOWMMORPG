const express = require('express');
const { gameDbPool } = require('../config/database.js');

const router = express.Router();

// Search for characters
router.get('/search', async (req, res) => {
  try {
    const { query, race, class: characterClass, minLevel = 1, limit = 50 } = req.query;
    
    let sql = `
      SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        c.logout_time,
        c.guildid,
        g.name as guild_name,
        c.totaltime
      FROM characters c
      LEFT JOIN guild_member gm ON c.guid = gm.guid
      LEFT JOIN guild g ON gm.guildid = g.guildid
      WHERE 1=1
    `;
    
    const params = [];
    
    if (query) {
      sql += ` AND c.name LIKE ?`;
      params.push(`%${query}%`);
    }
    
    if (race) {
      sql += ` AND c.race = ?`;
      params.push(parseInt(race));
    }
    
    if (characterClass) {
      sql += ` AND c.class = ?`;
      params.push(parseInt(characterClass));
    }
    
    if (minLevel) {
      sql += ` AND c.level >= ?`;
      params.push(parseInt(minLevel));
    }
    
    sql += ` ORDER BY c.level DESC, c.totaltime DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [characters] = await gameDbPool.query(sql, params);
    
    const formattedCharacters = characters.map(char => ({
      guid: char.guid,
      name: char.name,
      race: char.race,
      class: char.class,
      level: char.level,
      gender: char.gender,
      lastSeen: char.logout_time,
      guildId: char.guildid,
      guildName: char.guild_name,
      totalHours: (char.totaltime / 3600).toFixed(1)
    }));
    
    res.json({
      success: true,
      characters: formattedCharacters,
      count: formattedCharacters.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to search characters:', error);
    res.status(500).json({ success: false, error: 'Failed to search characters' });
  }
});

// Get character profile
router.get('/character/:guid', async (req, res) => {
  try {
    const { guid } = req.params;
    
    // Get basic character info
    const [characters] = await gameDbPool.query(
      `SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        c.logout_time,
        c.guildid,
        g.name as guild_name,
        g.motd as guild_motd,
        c.totaltime,
        c.account,
        c.map,
        c.zone,
        c.position_x,
        c.position_y,
        c.position_z
      FROM characters c
      LEFT JOIN guild_member gm ON c.guid = gm.guid
      LEFT JOIN guild g ON gm.guildid = g.guildid
      WHERE c.guid = ?`,
      [guid]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }
    
    const character = characters[0];
    
    // Get character stats
    const [stats] = await gameDbPool.query(
      `SELECT * FROM character_stats WHERE guid = ?`,
      [guid]
    );
    
    // Get character equipment
    const [equipment] = await gameDbPool.query(
      `SELECT 
        ci.slot,
        ci.item_template,
        it.name as item_name,
        it.ItemLevel,
        it.Quality,
        it.SocketColor_1,
        it.SocketColor_2,
        it.SocketColor_3,
        it.StatType1,
        it.StatValue1,
        it.StatType2,
        it.StatValue2,
        it.StatType3,
        it.StatValue3,
        it.StatType4,
        it.StatValue4,
        it.Armor,
        it.HolyRes,
        it.FireRes,
        it.NatureRes,
        it.FrostRes,
        it.ShadowRes,
        it.ArcaneRes
      FROM character_inventory ci
      LEFT JOIN item_template it ON ci.item_template = it.entry
      WHERE ci.guid = ? AND ci.bag = 0
      ORDER BY ci.slot`,
      [guid]
    );
    
    // Get character achievements
    const [achievements] = await gameDbPool.query(
      `SELECT 
        ca.achievement,
        ca.date,
        a.name as achievement_name,
        a.description,
        a.points,
        a.icon
      FROM character_achievement ca
      LEFT JOIN achievement a ON ca.achievement = a.id
      WHERE ca.guid = ?
      ORDER BY ca.date DESC
      LIMIT 20`,
      [guid]
    );
    
    // Get character skills
    const [skills] = await gameDbPool.query(
      `SELECT 
        cs.skill,
        cs.value,
        cs.max,
        s.name as skill_name,
        s.description
      FROM character_skills cs
      LEFT JOIN skill s ON cs.skill = s.id
      WHERE cs.guid = ?
      ORDER BY cs.value DESC`,
      [guid]
    );
    
    // Get character reputation
    const [reputation] = await gameDbPool.query(
      `SELECT 
        cr.faction,
        cr.standing,
        cr.value,
        f.name as faction_name,
        f.description as faction_description
      FROM character_reputation cr
      LEFT JOIN faction f ON cr.faction = f.id
      WHERE cr.guid = ?`,
      [guid]
    );
    
    // Format the response
    const formattedCharacter = {
      basic: {
        guid: character.guid,
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        gender: character.gender,
        lastSeen: character.logout_time,
        totalHours: (character.totaltime / 3600).toFixed(1),
        location: {
          map: character.map,
          zone: character.zone,
          position: {
            x: character.position_x,
            y: character.position_y,
            z: character.position_z
          }
        }
      },
      guild: character.guild_name ? {
        id: character.guildid,
        name: character.guild_name,
        motd: character.guild_motd
      } : null,
      stats: stats[0] || {},
      equipment: equipment.map(item => ({
        slot: item.slot,
        itemTemplate: item.item_template,
        name: item.item_name,
        itemLevel: item.ItemLevel,
        quality: item.Quality,
        sockets: [
          item.SocketColor_1,
          item.SocketColor_2,
          item.SocketColor_3
        ].filter(Boolean),
        stats: {
          armor: item.Armor,
          holyRes: item.HolyRes,
          fireRes: item.FireRes,
          natureRes: item.NatureRes,
          frostRes: item.FrostRes,
          shadowRes: item.ShadowRes,
          arcaneRes: item.ArcaneRes,
          stat1: { type: item.StatType1, value: item.StatValue1 },
          stat2: { type: item.StatType2, value: item.StatValue2 },
          stat3: { type: item.StatType3, value: item.StatValue3 },
          stat4: { type: item.StatType4, value: item.StatValue4 }
        }
      })),
      achievements: achievements.map(ach => ({
        id: ach.achievement,
        name: ach.achievement_name,
        description: ach.description,
        points: ach.points,
        icon: ach.icon,
        completedDate: ach.date
      })),
      skills: skills.map(skill => ({
        id: skill.skill,
        name: skill.skill_name,
        description: skill.description,
        value: skill.value,
        max: skill.max,
        progress: skill.max > 0 ? ((skill.value / skill.max) * 100).toFixed(1) : 100
      })),
      reputation: reputation.map(rep => ({
        id: rep.faction,
        name: rep.faction_name,
        description: rep.faction_description,
        standing: rep.standing,
        value: rep.value
      }))
    };
    
    res.json({
      success: true,
      character: formattedCharacter,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch character profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch character profile' });
  }
});

// Get race information
router.get('/races', async (req, res) => {
  try {
    const [races] = await gameDbPool.query(
      `SELECT id, name, faction, male_display_id, female_display_id FROM chr_races`
    );
    
    res.json({
      success: true,
      races,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch races:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch races' });
  }
});

// Get class information
router.get('/classes', async (req, res) => {
  try {
    const [classes] = await gameDbPool.query(
      `SELECT id, name, mask, power_type FROM chr_classes`
    );
    
    res.json({
      success: true,
      classes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch classes' });
  }
});

// Get popular characters (by play time)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const [characters] = await gameDbPool.query(
      `SELECT 
        c.guid,
        c.name,
        c.race,
        c.class,
        c.level,
        c.gender,
        c.logout_time,
        c.guildid,
        g.name as guild_name,
        c.totaltime
      FROM characters c
      LEFT JOIN guild_member gm ON c.guid = gm.guid
      LEFT JOIN guild g ON gm.guildid = g.guildid
      WHERE c.level >= 70
      ORDER BY c.totaltime DESC
      LIMIT ?`,
      [parseInt(limit)]
    );
    
    const formattedCharacters = characters.map(char => ({
      guid: char.guid,
      name: char.name,
      race: char.race,
      class: char.class,
      level: char.level,
      gender: char.gender,
      lastSeen: char.logout_time,
      guildName: char.guild_name,
      totalHours: (char.totaltime / 3600).toFixed(1)
    }));
    
    res.json({
      success: true,
      characters: formattedCharacters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch popular characters:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular characters' });
  }
});

module.exports = router;