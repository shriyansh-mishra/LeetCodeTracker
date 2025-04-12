const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS user_platforms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        username VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, platform_type)
      );
      
      CREATE TABLE IF NOT EXISTS platform_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        total_solved INTEGER,
        easy_solved INTEGER,
        medium_solved INTEGER,
        hard_solved INTEGER,
        total_submissions INTEGER,
        acceptance_rate VARCHAR(50),
        ranking VARCHAR(100),
        contest_attended INTEGER,
        additional_data JSONB,
        last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, platform_type)
      );
      
      CREATE TABLE IF NOT EXISTS submission_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        count INTEGER NOT NULL,
        UNIQUE(user_id, platform_type, date)
      );
      
      CREATE TABLE IF NOT EXISTS language_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        language VARCHAR(100) NOT NULL,
        count INTEGER NOT NULL,
        percentage VARCHAR(50) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS contest_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform_type VARCHAR(50) NOT NULL,
        contest_name VARCHAR(255) NOT NULL,
        ranking VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        date TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR(255) NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);
    `);
    
    console.log('Database migration completed successfully');
    return true;
  } catch (err) {
    console.error('Database migration failed:', err);
    return false;
  } finally {
    await pool.end();
  }
}

createTables().then(success => {
  process.exit(success ? 0 : 1);
});