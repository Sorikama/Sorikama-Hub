// src/services/proxy.service.ts
import axios, { Method } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Crée un middleware Express pour rediriger (proxy) une requête vers un microservice de base.
 * C'est une fonction d'ordre supérieur : elle prend une URL de base et retourne une fonction middleware.
 *
 * @param {string} baseUrl - L'URL de base du microservice cible (ex: 'http://localhost:3001').
 * @returns {Function} Une fonction middleware Express asynchrone.
 */
export const proxyRequest = (baseUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Construit l'URL complète de la destination
    // On retire le préfixe '/api/v1' de l'URL pour ne pas le transmettre au microservice.
    const targetUrl = `${baseUrl}${req.originalUrl.replace('/api/v1', '')}`;

    logger.info(`Redirection de la requête : ${req.method} ${req.originalUrl} -> ${targetUrl}`);

    try {
      // Effectue la requête vers le microservice en utilisant axios
      const response = await axios({
        method: req.method as Method, // 'GET', 'POST', 'PATCH', etc.
        url: targetUrl,
        data: req.body, // Transfère le corps de la requête originale
        // On transfère sélectivement les en-têtes pertinents.
        // NE JAMAIS transférer tous les en-têtes sans filtrage (sécurité).
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          // Transfère le token d'autorisation pour que le microservice puisse, si besoin,
          // effectuer ses propres vérifications ou identifier l'utilisateur.
          'Authorization': req.headers.authorization,
          // Transfère les en-têtes personnalisés que nous avons ajoutés
          // pour identifier l'utilisateur et ses rôles.
          'X-User-Id': req.headers['x-user-id'],
          'X-User-Roles': req.headers['x-user-roles'],
        },
      });

      // Si la requête au microservice réussit, on renvoie sa réponse
      // (status code et données) au client original.
      res.status(response.status).json(response.data);

    } catch (error: any) {
      // Si la requête au microservice échoue, on gère l'erreur.
      if (error.response) {
        // L'erreur provient du microservice (ex: 404, 400, 500).
        // On renvoie la même erreur au client original.
        logger.error(`Erreur du microservice [${targetUrl}] : ${error.response.status}`, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        // L'erreur est probablement d'ordre réseau (ex: microservice inaccessible).
        // On passe l'erreur à notre gestionnaire d'erreurs global qui enverra
        // une réponse 502 (Bad Gateway) ou 503 (Service Unavailable).
        logger.error(`Erreur de connexion au microservice [${targetUrl}]`, error.message);
        next(error);
      }
    }
  };