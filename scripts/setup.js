// =============================================================================
// ELECTRA — Installation Script
// Run: node scripts/setup.js
// =============================================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ELECTRA — Setup Script\n');

// Check Node version
const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
if (nodeVersion < 20) {
  console.error('❌ Node.js 20+ required');
  process.exit(1);
}

console.log('✓ Node.js version OK:', process.version);

// Copy .env if not exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✓ Created .env.local from .env.example');
  console.log('  ⚠️  Fill in your API keys in .env.local before running!');
} else {
  console.log('✓ .env.local already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// Generate Prisma client
console.log('\n⚙️  Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✓ Prisma client generated');
} catch {
  console.log('⚠️  Prisma generate skipped (DATABASE_URL not set)');
}

console.log('\n✅ Setup complete!');
console.log('\nNext steps:');
console.log('  1. Fill in .env.local with your API keys (GEMINI_API_KEY, DATABASE_URL)');
console.log('  2. Run: npm run docker:up  (starts PostgreSQL + Redis)');
console.log('  3. Run: npm run db:migrate (applies database migrations)');
console.log('  4. Run: npm run db:seed    (seeds civic intelligence data)');
console.log('  5. Run: npm run dev        (starts API + Web + Admin)');
console.log('\nNavigate Every Election. 🗳️');
