const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace template values with actual environment variables
envContent = envContent.replace('TEMPLATE_DB_URL', process.env.DATABASE_URL || '');
envContent = envContent.replace('TEMPLATE_PGUSER', process.env.PGUSER || '');
envContent = envContent.replace('TEMPLATE_PGHOST', process.env.PGHOST || '');
envContent = envContent.replace('TEMPLATE_PGPASSWORD', process.env.PGPASSWORD || '');
envContent = envContent.replace('TEMPLATE_PGDATABASE', process.env.PGDATABASE || '');
envContent = envContent.replace('TEMPLATE_PGPORT', process.env.PGPORT || '');

// Write updated content back to .env file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('Environment variables updated successfully');