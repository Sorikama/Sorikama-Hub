// start-dev.js - Script de démarrage en développement
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de Sorikama Hub en mode développement...\n');

// Démarrer avec ts-node-dev en ignorant les erreurs TypeScript
const server = spawn('npx', [
  'ts-node-dev',
  '--respawn',
  '--transpile-only', // Ignore les erreurs TypeScript
  '--ignore-watch', 'node_modules',
  '--ignore-watch', 'dist',
  'src/index.ts'
], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
});

server.on('close', (code) => {
  console.log(`\n🛑 Serveur arrêté avec le code ${code}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGTERM');
});