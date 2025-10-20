const { exec, spawn } = require('child_process');

// Forcer le nettoyage du port 7000
exec('netstat -ano | findstr :7000', (error, stdout) => {
  if (stdout) {
    const pids = stdout.split('\n')
      .filter(line => line.includes(':7000'))
      .map(line => line.trim().split(/\s+/).pop())
      .filter(pid => pid && pid !== '0');
    
    pids.forEach(pid => {
      exec(`taskkill /PID ${pid} /F`, () => {});
    });
  }
  
  // Démarrer immédiatement
  setTimeout(() => {
    spawn('ts-node-dev', ['--respawn', '--transpile-only', 'src/index.ts'], {
      stdio: 'inherit',
      shell: true
    });
  }, 1000);
});