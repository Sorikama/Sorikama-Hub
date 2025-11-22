const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development server (quick start)...\n');

// Start the dev server directly without killing port
const dev = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

dev.on('error', (error) => {
  console.error('❌ Failed to start dev server:', error);
  process.exit(1);
});

dev.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
  process.exit(code);
});
