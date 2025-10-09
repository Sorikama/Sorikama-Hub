// src/types/express.d.ts
import { IUser } from '../database/models/user.model'; // Importez votre interface utilisateur

// On utilise 'declare global' pour fusionner notre déclaration avec les types existants d'Express
declare global {
  namespace Express {
    // On étend l'interface Request originale
    export interface Request {
      user?: IUser; // La propriété 'user' est maintenant officiellement partie du type Request
    }
  }
}