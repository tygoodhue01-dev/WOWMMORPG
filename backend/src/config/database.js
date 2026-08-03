import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const gameDbPool = mysql.createPool({
  host: '20.245.100.238',
  port: 3306,
  user: 'acore',
  password: 'GrayConan1$',
  database: 'acore_auth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const supabase = createClient(
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

export async function testConnections() {
  try {
    const gameConnection = await gameDbPool.getConnection();
    console.log('✓ Game database connected');
    gameConnection.release();

    const { data, error } = await supabase.from('realms').select('count').limit(1);
    if (error) throw error;
    console.log('✓ Supabase connected');

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}