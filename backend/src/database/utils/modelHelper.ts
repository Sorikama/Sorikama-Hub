/**
 * Utilitaire pour créer des modèles Mongoose sans erreur de recompilation
 * en mode développement avec hot-reload
 */

import { Model, Schema, model as mongooseModel } from 'mongoose';

/**
 * Crée ou récupère un modèle Mongoose de manière sécurisée
 * Évite l'erreur "Cannot overwrite model once compiled" en développement
 * 
 * @param modelName - Nom du modèle
 * @param schema - Schéma Mongoose
 * @returns Le modèle Mongoose
 */
export function getOrCreateModel<T>(
  modelName: string,
  schema: Schema<T>
): Model<T> {
  // En développement, vérifier si le modèle existe déjà dans le cache global
  if (process.env.NODE_ENV !== 'production') {
    const globalCache = (global as any).mongooseModels || {};
    
    if (globalCache[modelName]) {
      return globalCache[modelName];
    }
    
    const newModel = mongooseModel<T>(modelName, schema);
    globalCache[modelName] = newModel;
    (global as any).mongooseModels = globalCache;
    
    return newModel;
  }
  
  // En production, créer le modèle normalement
  return mongooseModel<T>(modelName, schema);
}
