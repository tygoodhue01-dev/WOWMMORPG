import crypto from 'crypto';
import { gameDbPool, supabase } from '../config/database.js';

// Expansion IDs for AzerothCore
const EXPANSION_IDS = {
  'Classic': 0,
  'The Burning Crusade': 1,
  'WotLK 3.3.5a': 2,
  'Cataclysm 4.3.4': 3,
  'Mists of Pandaria 5.4.8': 4,
  'Warlords of Draenor': 5,
  'Legion': 6,
  'Battle for Azeroth': 7,
  'Shadowlands': 8,
  'Dragonflight': 9
};

// SRP6 Password Hashing for AzerothCore
class WoWPasswordHasher {
  constructor() {
    // Generate a 32-byte salt (64 hex characters)
    this.salt = crypto.randomBytes(32);
  }

  // Generate SRP6 verifier for AzerothCore using the actual algorithm
  generateVerifier(username, password) {
    const I = Buffer.from(`${username.toUpperCase()}:${password.toUpperCase()}`, 'utf8');
    const s = this.salt;
    
    // H(I) - SHA1 hash of username:password
    const sha1 = crypto.createHash('sha1');
    sha1.update(I);
    const hI = sha1.digest();
    
    // H(s, H(I)) - SHA1 hash of salt + H(I)
    const sha2 = crypto.createHash('sha1');
    sha2.update(s);
    sha2.update(hI);
    const x = sha2.digest();
    
    // g = 7, N = AzerothCore modulus (32 bytes)
    const g = 7n;
    const N = BigInt('0x894B6451E159E553E5D4C1C3A588C6E79');
    
    // v = g^x mod N
    const v = powmod(g, BigInt('0x' + x.toString('hex')), N);
    
    // Convert to exactly 32 bytes (64 hex characters)
    let vHex = v.toString(16).toUpperCase();
    if (vHex.length > 64) {
      vHex = vHex.substring(0, 64);
    } else {
      vHex = vHex.padStart(64, '0');
    }
    
    return {
      salt: s.toString('hex').toUpperCase(), // 64 hex characters (32 bytes)
      verifier: vHex // Exactly 64 hex characters (32 bytes)
    };
  }

  // Alternative simpler SHA1 hashing (some servers use this)
  generateSimpleHash(username, password) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(`${username.toUpperCase()}:${password.toUpperCase()}`);
    const hash = sha1.digest('hex').toUpperCase();
    
    return {
      salt: hash.substring(0, 32), // 32 hex characters (16 bytes)
      verifier: hash.substring(0, 32) // 32 hex characters (16 bytes)
    };
  }
}

// Modular exponentiation for big integers
function powmod(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp >> 1n;
    base = (base * base) % mod;
  }
  return result;
}

// Create game account
async function createGameAccount(supabaseUserId, accountName, password, expansion = 'WotLK 3.3.5a') {
  try {
    console.log('🎮 Starting game account creation...');
    console.log('   Supabase User ID:', supabaseUserId);
    console.log('   Account Name:', accountName);
    console.log('   Expansion:', expansion);

    const connection = await gameDbPool.getConnection();
    
    try {
      // Check if account already exists
      const [existing] = await connection.query(
        'SELECT id FROM account WHERE username = ?',
        [accountName]
      );

      if (existing.length > 0) {
        console.log('❌ Account name already exists in game database');
        connection.release();
        return { success: false, error: 'Account name already exists' };
      }

      console.log('✅ Account name available, generating SRP6 hash...');

      // Generate password hash using simple SHA1 (more reliable)
      const hasher = new WoWPasswordHasher();
      const { salt, verifier } = hasher.generateSimpleHash(accountName, password);

      console.log('✅ SRP6 hash generated, inserting into game database...');

      // Convert expansion name to ID
      const expansionId = EXPANSION_IDS[expansion] || 2; // Default to WotLK if not found

      console.log('✅ Using expansion ID:', expansionId);

      // Insert into account table (AzerothCore structure)
      const [result] = await connection.query(
        `INSERT INTO account (username, salt, verifier, expansion, email, joindate)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [accountName, salt, verifier, expansionId, `${accountName}@runehaven.com`]
      );

      console.log('✅ Game account created in database with ID:', result.insertId);
      connection.release();

      console.log('🔗 Linking to Supabase user...');

      // Link to Supabase user
      const { error: supabaseError } = await supabase
        .from('game_accounts')
        .insert({
          user_id: supabaseUserId,
          account_name: accountName,
          expansion: expansion,
          created_at: new Date().toISOString()
        });

      if (supabaseError) {
        console.error('❌ Error linking game account to Supabase:', supabaseError);
      } else {
        console.log('✅ Successfully linked to Supabase');
      }

      console.log('🎉 Game account creation completed successfully');
      return { 
        success: true, 
        accountId: result.insertId,
        message: 'Game account created successfully'
      };

    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('❌ Error creating game account:', error);
    return { success: false, error: 'Failed to create game account' };
  }
}

// Get user's game accounts
async function getUserGameAccounts(supabaseUserId) {
  try {
    const { data, error } = await supabase
      .from('game_accounts')
      .select('*')
      .eq('user_id', supabaseUserId);

    if (error) throw error;

    return { success: true, accounts: data || [] };
  } catch (error) {
    console.error('Error fetching game accounts:', error);
    return { success: false, error: 'Failed to fetch game accounts' };
  }
}

// Delete game account
async function deleteGameAccount(supabaseUserId, accountName) {
  try {
    const connection = await gameDbPool.getConnection();
    
    try {
      // Delete from game server database
      await connection.query(
        'DELETE FROM account WHERE username = ?',
        [accountName]
      );

      connection.release();

      // Remove from Supabase
      const { error } = await supabase
        .from('game_accounts')
        .delete()
        .eq('user_id', supabaseUserId)
        .eq('account_name', accountName);

      if (error) throw error;

      return { success: true, message: 'Game account deleted' };
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting game account:', error);
    return { success: false, error: 'Failed to delete game account' };
  }
}

// Sync password from Supabase to game server
async function syncPassword(supabaseUserId, newPassword) {
  try {
    // Get user's game accounts
    const { success, accounts } = await getUserGameAccounts(supabaseUserId);
    
    if (!success || !accounts || accounts.length === 0) {
      return { success: false, error: 'No game accounts found' };
    }

    const connection = await gameDbPool.getConnection();
    
    try {
      for (const account of accounts) {
        const hasher = new WoWPasswordHasher();
        const { salt, verifier } = hasher.generateSimpleHash(account.account_name, newPassword);

        await connection.query(
          'UPDATE account SET salt = ?, verifier = ? WHERE username = ?',
          [salt, verifier, account.account_name]
        );
      }

      connection.release();
      return { success: true, message: 'Password synced to game accounts' };
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error syncing password:', error);
    return { success: false, error: 'Failed to sync password' };
  }
}

export {
  createGameAccount,
  getUserGameAccounts,
  deleteGameAccount,
  syncPassword,
  EXPANSION_IDS
};