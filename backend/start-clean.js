const { spawn } = require('child_process');
const path = require('path');

console.log('🧹 Starting development server with clean build...\n');

// Kill any process on port 7000 first
const killPort = spawn('cmd', ['/c', 'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :7000\') do taskkill /PID %a /F'], {
  shell: true,
  stdio: 'inherit'
});

killPort.on('close', (code) => {
  console.log('✅ Port 7000 cleared\n');
  
  // Start the dev server
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
});
