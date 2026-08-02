import { gameDbPool, supabase } from '../config/database.js';
import mysql from 'mysql2/promise';
import net from 'net';

// Characters database pool for AzerothCore
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

// Check if game server is actually running by connecting to the game server port
function checkGameServerOnline(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(3000); // 3 second timeout
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Fetch realm status from game server database
async function getRealmStatusFromGameServer() {
  try {
    const connection = await gameDbPool.getConnection();
    
    try {
      // Query realmlist table for realm information
      const [realms] = await connection.query(`
        SELECT id, name, address, port, icon, flag, timezone, 
               allowedSecurityLevel, population, gamebuild
        FROM realmlist
      `);

      // Query account table for total accounts
      const [accountStats] = await connection.query(`
        SELECT COUNT(*) as total_accounts
        FROM account
      `);

      connection.release();

      // Try to connect to character database to check if realm is truly online
      let realmOnline = false;
      let onlineCharacters = 0;
      
      try {
        const charConnection = await characterDbPool.getConnection();
        const [onlineStats] = await charConnection.query(`
          SELECT COUNT(*) as online_characters
          FROM characters
          WHERE online = 1
        `);
        charConnection.release();
        onlineCharacters = onlineStats[0]?.online_characters || 0;
        
        // Check if game server is actually running
        for (const realm of realms) {
          const isServerRunning = await checkGameServerOnline(realm.address, realm.port);
          if (isServerRunning) {
            realmOnline = true;
            break;
          }
        }
      } catch (charError) {
        console.log('Character database not accessible, realm may be offline');
        realmOnline = false;
      }

      return {
        realms: realms.map(realm => ({
          id: realm.id.toString(),
          name: realm.name || 'Rune Haven',
          host: realm.address,
          port: realm.port,
          type: getRealmType(realm.icon),
          expansion: getExpansionFromBuild(realm.gamebuild),
          online: realmOnline,
          players_online: onlineCharacters,
          max_players: getMaxPlayersForType(realm.icon),
          uptime: calculateUptime(),
          description: `Rune Haven realm`,
          display_order: realm.id
        })),
        total_accounts: accountStats[0]?.total_accounts || 0
      };
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error fetching realm status from game server:', error);
    return null;
  }
}

// Helper functions
function getRealmType(icon) {
  const types = {
    0: 'Normal',
    1: 'PvP',
    2: 'RP',
    3: 'RP PvP',
    4: 'PvE',
    6: 'RP PvP',
    8: 'Normal'
  };
  return types[icon] || 'PvP';
}

function getExpansionFromBuild(build) {
  if (!build) return 'Unknown';
  const buildNum = parseInt(build);
  if (buildNum >= 12340 && buildNum < 13623) return 'WotLK 3.3.5a';
  if (buildNum >= 13623 && buildNum < 15050) return 'Cataclysm 4.3.4';
  if (buildNum >= 15050 && buildNum < 18291) return 'Mists of Pandaria 5.4.8';
  return 'Unknown';
}

function getMaxPlayersForType(icon) {
  const maxPlayers = {
    0: 3000, // Normal
    1: 3500, // PvP
    2: 2000, // RP
    3: 2500, // RP PvP
    4: 3000, // PvE
    6: 2500, // RP PvP
    8: 3000  // Normal
  };
  return maxPlayers[icon] || 3000;
}

function calculateUptime() {
  // This would ideally come from game server process
  // For now, return a placeholder
  return '0d 0h 0m';
}

// Update Supabase with current realm status
async function updateSupabaseRealmStatus() {
  try {
    const gameData = await getRealmStatusFromGameServer();
    if (!gameData) return;

    console.log('Game data:', JSON.stringify(gameData, null, 2));

    for (const realm of gameData.realms) {
      // Use the exact UUID from your existing Supabase data
      const uuidId = '00000000-0000-0000-0000-000040697873';
      
      // First, check if the realm exists and if the host has been manually edited
      const { data: existingRealm } = await supabase
        .from('realms')
        .select('host')
        .eq('id', uuidId)
        .single();
      
      // If the realm exists and has a custom host that's different from game server, preserve it
      const useCustomHost = existingRealm && existingRealm.host && existingRealm.host !== realm.host;
      
      const { error } = await supabase
        .from('realms')
        .upsert({
          id: uuidId,
          name: 'Rune Haven',
          type: realm.type,
          expansion: realm.expansion,
          host: useCustomHost ? existingRealm.host : realm.host, // Preserve custom host if set
          port: realm.port,
          online: realm.online,
          players_online: realm.players_online,
          max_players: realm.max_players,
          uptime: realm.uptime,
          description: 'Rune Haven realm',
          display_order: realm.display_order,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error(`Error updating realm Rune Haven:`, error);
      } else {
        console.log(`✓ Updated realm status: Rune Haven with ${realm.players_online} players online, online: ${realm.online}`);
        if (useCustomHost) {
          console.log(`  - Preserved custom host: ${existingRealm.host}`);
        }
      }
    }

    // Update server info
    await supabase
      .from('server_info')
      .upsert({
        key: 'total_accounts',
        label: 'Total Accounts',
        value: gameData.total_accounts.toString(),
        category: 'General',
        display_order: 1
      }, {
        onConflict: 'key'
      });

    // Calculate total players from all realms
    const totalPlayers = gameData.realms.reduce((sum, realm) => sum + realm.players_online, 0);
    
    await supabase
      .from('server_info')
      .upsert({
        key: 'total_players',
        label: 'Total Players',
        value: totalPlayers.toString(),
        category: 'General',
        display_order: 0
      }, {
        onConflict: 'key'
      });

    // Update discord members (remove old demo data)
    await supabase
      .from('server_info')
      .upsert({
        key: 'discord_members',
        label: 'Discord Members',
        value: '0', // Set to 0 or remove if not tracking
        category: 'Social',
        display_order: 2
      }, {
        onConflict: 'key'
      });

    // Update uptime (remove hardcoded 99.9%)
    await supabase
      .from('server_info')
      .upsert({
        key: 'uptime',
        label: 'Uptime',
        value: '0%', // Or calculate real uptime from game server
        category: 'General',
        display_order: 3
      }, {
        onConflict: 'key'
      });

  } catch (error) {
    console.error('Error updating Supabase realm status:', error);
  }
}

// Start polling for realm status
export function startRealmStatusPolling() {
  const interval = process.env.REALM_UPDATE_INTERVAL || 30000; // Default 30 seconds
  
  console.log(`Starting realm status polling (interval: ${interval}ms)`);
  
  // Initial update
  updateSupabaseRealmStatus();
  
  // Set up interval
  setInterval(updateSupabaseRealmStatus, interval);
}

// Manual trigger for testing
export async function triggerRealmUpdate() {
  await updateSupabaseRealmStatus();
  return { success: true, message: 'Realm status updated' };
}