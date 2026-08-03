const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

exports.gameDbPool = mysql.createPool({
  host: '20.245.100.238',
  port: 3306,
  user: 'acore',
  password: 'GrayConan1$',
  database: 'acore_auth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.supabase = createClient(
  'https://rbhpjvqtxquoqswnpwib.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHBqdnF0eHF1b3Fzd25wd2liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTIwNzMyMywiZXhwIjoyMTAwNzgzMzIzfQ.B0JdbePdL4wlFwyhMgopH4UnqeRCHXB7H0CoA1KgrG4',
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: false,
    global: {
      headers: {
        'X-Client-Info': 'azeroth-backend'
      }
    }
  }
);

exports.testConnections = async function() {
  try {
    const gameConnection = await exports.gameDbPool.getConnection();
    console.log('✓ Game database connected');
    gameConnection.release();

    const { data, error } = await exports.supabase.from('realms').select('count').limit(1);
    if (error) throw error;
    console.log('✓ Supabase connected');

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};