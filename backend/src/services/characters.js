const mysql = require('mysql2/promise');
const { gameDbPool } = require('../config/database.js');

// Character database pool (AzerothCore uses separate character database)
const characterDbPool = mysql.createPool({
  host: '20.245.100.238',
  port: 3306,
  user: 'acore',
  password: 'GrayConan1$',
  database: 'acore_characters',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get characters for a game account
async function getCharacters(accountName) {
  try {
    const connection = await characterDbPool.getConnection();
    
    try {
      // Get account ID from auth database
      const authConnection = await gameDbPool.getConnection();
      const [accountResult] = await authConnection.query(
        'SELECT id FROM account WHERE username = ?',
        [accountName]
      );
      authConnection.release();

      if (accountResult.length === 0) {
        connection.release();
        return { success: true, characters: [] };
      }

      const accountId = accountResult[0].id;

      // Query characters database
      const [characters] = await connection.query(`
        SELECT c.guid, c.name, c.race, c.class, c.level, c.gender, c.online,
               c.totalKills, c.arenaPoints, c.totalHonorPoints,
               c.money, c.position_x, c.position_y, c.position_z, c.map
        FROM characters c
        WHERE c.account = ?
        ORDER BY c.level DESC, c.name ASC
      `, [accountId]);

      connection.release();

      return {
        success: true,
        characters: characters.map(char => ({
          guid: char.guid,
          name: char.name,
          race: getRaceName(char.race),
          class: getClassName(char.class),
          level: char.level,
          gender: getGenderName(char.gender),
          online: char.online === 1,
          totalKills: char.totalKills,
          arenaPoints: char.arenaPoints,
          honorPoints: char.totalHonorPoints,
          money: formatMoney(char.money),
          location: {
            x: char.position_x,
            y: char.position_y,
            z: char.position_z,
            map: char.map
          }
        }))
      };
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error fetching characters:', error);
    return { success: false, error: 'Failed to fetch characters' };
  }
}

// Helper functions for character data
function getRaceName(raceId) {
  const races = {
    1: 'Human',
    2: 'Orc',
    3: 'Dwarf',
    4: 'Night Elf',
    5: 'Undead',
    6: 'Tauren',
    7: 'Gnome',
    8: 'Troll',
    10: 'Blood Elf',
    11: 'Draenei'
  };
  return races[raceId] || 'Unknown';
}

function getClassName(classId) {
  const classes = {
    1: 'Warrior',
    2: 'Paladin',
    3: 'Hunter',
    4: 'Rogue',
    5: 'Priest',
    6: 'Death Knight',
    7: 'Shaman',
    8: 'Mage',
    9: 'Warlock',
    11: 'Druid'
  };
  return classes[classId] || 'Unknown';
}

function getGenderName(genderId) {
  const genders = {
    0: 'Male',
    1: 'Female'
  };
  return genders[genderId] || 'Unknown';
}

function formatMoney(copper) {
  if (!copper) return '0g 0s 0c';
  
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperCoins = copper % 100;
  
  return `${gold}g ${silver}s ${copperCoins}c`;
}

// Get character summary stats
async function getCharacterStats(accountName) {
  try {
    const connection = await characterDbPool.getConnection();
    
    try {
      // Get account ID from auth database
      const authConnection = await gameDbPool.getConnection();
      const [accountResult] = await authConnection.query(
        'SELECT id FROM account WHERE username = ?',
        [accountName]
      );
      authConnection.release();

      if (accountResult.length === 0) {
        connection.release();
        return { success: true, stats: { totalCharacters: 0, onlineCharacters: 0, maxLevel: 0, avgLevel: 0, totalKills: 0 } };
      }

      const accountId = accountResult[0].id;

      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total_characters,
          SUM(CASE WHEN online = 1 THEN 1 ELSE 0 END) as online_characters,
          MAX(level) as max_level,
          AVG(level) as avg_level,
          SUM(totalKills) as total_kills
        FROM characters c
        WHERE c.account = ?
      `, [accountId]);

      connection.release();

      return {
        success: true,
        stats: {
          totalCharacters: stats[0]?.total_characters || 0,
          onlineCharacters: stats[0]?.online_characters || 0,
          maxLevel: stats[0]?.max_level || 0,
          avgLevel: Math.round(stats[0]?.avg_level || 0),
          totalKills: stats[0]?.total_kills || 0
        }
      };
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error fetching character stats:', error);
    return { success: false, error: 'Failed to fetch character stats' };
  }
}

module.exports = {
  getCharacters,
  getCharacterStats
};