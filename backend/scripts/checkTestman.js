import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';

const adminSupabase = createClient(
  'https://rbhpjvqtxquoqswnpwib.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHBqdnF0eHF1b3Fzd25wd2liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTIwNzMyMywiZXhwIjoyMTAwNzgzMzIzfQ.B0JdbePdL4wlFwyhMgopH4UnqeRCHXB7H0CoA1KgrG4'
);

async function checkTestman() {
  console.log('🔍 Checking for game account: testman\n');

  // 1. Check Supabase game_accounts table
  try {
    const { data: gameAccounts, error } = await adminSupabase
      .from('game_accounts')
      .select('*')
      .eq('account_name', 'testman');

    if (error) {
      console.log('❌ Supabase game_accounts check failed:', error.message);
    } else if (gameAccounts && gameAccounts.length > 0) {
      console.log('✅ Found in Supabase game_accounts:');
      console.log('   User ID:', gameAccounts[0].user_id);
      console.log('   Account Name:', gameAccounts[0].account_name);
      console.log('   Expansion:', gameAccounts[0].expansion);
      console.log('   Created:', gameAccounts[0].created_at);
    } else {
      console.log('❌ Not found in Supabase game_accounts');
    }
  } catch (error) {
    console.log('❌ Supabase check error:', error.message);
  }

  // 2. Check AzerothCore MySQL database
  try {
    const connection = await mysql.createConnection({
      host: '20.245.100.238',
      port: 3306,
      user: 'acore',
      password: 'GrayConan1$',
      database: 'acore_auth'
    });

    const [accounts] = await connection.query(
      'SELECT id, username, email, joindate, expansion FROM account WHERE username = ?',
      ['testman']
    );

    if (accounts.length > 0) {
      console.log('\n✅ Found in AzerothCore account table:');
      console.log('   Account ID:', accounts[0].id);
      console.log('   Username:', accounts[0].username);
      console.log('   Email:', accounts[0].email);
      console.log('   Joined:', accounts[0].joindate);
      console.log('   Expansion:', accounts[0].expansion);
    } else {
      console.log('\n❌ Not found in AzerothCore account table');
    }

    await connection.end();
  } catch (error) {
    console.log('\n❌ MySQL check error:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('If both checks show ❌, the game account was not created.');
  console.log('This means the frontend is not calling the backend API correctly.');
}

checkTestman();