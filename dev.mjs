import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Nexus Development Servers...\n');

const api = spawn('npx', ['tsx', 'src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

const ui = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

api.on('error', (err) => console.error('API Error:', err));
ui.on('error', (err) => console.error('UI Error:', err));

process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  api.kill();
  ui.kill();
  process.exit();
});