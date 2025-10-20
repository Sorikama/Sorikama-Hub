// src/routes/dependencies.routes.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /dependencies - Page des dépendances du projet
 */
router.get('/', (req, res) => {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Lire le fichier HTML et injecter les données
    let dependenciesHTML = fs.readFileSync(path.join(__dirname, '../../public/views/dependencies.html'), 'utf8');
    
    // Préparer les données à injecter
    const packageData = {
      name: packageJson.name || 'Unknown Project',
      version: packageJson.version || '0.0.0',
      nodeVersion: process.version,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {}
    };
    
    // Injecter les données JavaScript
    const scriptInjection = `
      <script>
        window.packageData = ${JSON.stringify(packageData)};
      </script>
    `;
    
    // Injecter le script avant la fermeture du body
    dependenciesHTML = dependenciesHTML.replace('</body>', scriptInjection + '</body>');
    
    res.send(dependenciesHTML);

    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la lecture des dépendances'
    });
  }
});

export default router;