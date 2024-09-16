import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load .env files manually (supports multiple .env files)
dotenv.config({ path: '.env' });
dotenv.config({ path: '.development.env' });

// Run the app using tsx
execSync('npx tsx src/index.ts', { stdio: 'inherit' });
