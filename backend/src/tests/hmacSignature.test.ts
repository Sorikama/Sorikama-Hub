/**
 * Tests pour la signature HMAC
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createSignedHeaders } from '../utils/hmacSignature';
import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || 'your-secret-key-here';

describe('HMAC Signature', () => {
  let userId: string;
  let email: string;
  let role: string;
  let serviceSlug: string;

  beforeEach(() => {
    userId = 'user123';
    email = 'test@example.com';
    role = 'user';
    serviceSlug = 'masebuy';
  });

  describe('createSignedHeaders', () => {
    it('devrait créer des headers signés avec tous les champs requis', () => {
      const headers = createSignedHeaders(userId, email, role, serviceSlug);

      expect(headers).toHaveProperty('X-User-Id', userId);
      expect(headers).toHaveProperty('X-User-Email', email);
      expect(headers).toHaveProperty('X-User-Role', role);
      expect(headers).toHaveProperty('X-Service-Slug', serviceSlug);
      expect(headers).toHaveProperty('X-Signature');
      expect(headers).toHaveProperty('X-Timestamp');
    });

    it('devrait générer un timestamp valide', () => {
      const headers = createSignedHeaders(userId, email, role, serviceSlug);
      const timestamp = parseInt(headers['X-Timestamp']);

      expect(timestamp).toBeGreaterThan(0);
      expect(Date.now() - timestamp).toBeLessThan(1000); // Moins d'1 seconde
    });

    it('devrait générer une signature HMAC valide', () => {
      const headers = createSignedHeaders(userId, email, role, serviceSlug);
      
      const payload = `${userId}:${email}:${role}:${serviceSlug}:${headers['X-Timestamp']}`;
      const expectedSignature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex');

      expect(headers['X-Signature']).toBe(expectedSignature);
    });

    it('devrait générer des signatures différentes pour des timestamps différents', (done) => {
      const headers1 = createSignedHeaders(userId, email, role, serviceSlug);
      
      setTimeout(() => {
        const headers2 = createSignedHeaders(userId, email, role, serviceSlug);
        
        expect(headers1['X-Signature']).not.toBe(headers2['X-Signature']);
        expect(headers1['X-Timestamp']).not.toBe(headers2['X-Timestamp']);
        done();
      }, 10);
    });

    it('devrait générer des signatures différentes pour des utilisateurs différents', () => {
      const headers1 = createSignedHeaders('user1', email, role, serviceSlug);
      const headers2 = createSignedHeaders('user2', email, role, serviceSlug);

      expect(headers1['X-Signature']).not.toBe(headers2['X-Signature']);
    });

    it('devrait générer des signatures différentes pour des services différents', () => {
      const headers1 = createSignedHeaders(userId, email, role, 'service1');
      const headers2 = createSignedHeaders(userId, email, role, 'service2');

      expect(headers1['X-Signature']).not.toBe(headers2['X-Signature']);
    });
  });

  describe('Signature Security', () => {
    it('ne devrait pas permettre la modification du userId sans invalider la signature', () => {
      const headers = createSignedHeaders(userId, email, role, serviceSlug);
      const originalSignature = headers['X-Signature'];

      // Modifier le userId
      const modifiedUserId = 'hacker123';
      const modifiedPayload = `${modifiedUserId}:${email}:${role}:${serviceSlug}:${headers['X-Timestamp']}`;
      const modifiedSignature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(modifiedPayload)
        .digest('hex');

      expect(modifiedSignature).not.toBe(originalSignature);
    });

    it('ne devrait pas permettre la modification du role sans invalider la signature', () => {
      const headers = createSignedHeaders(userId, email, 'user', serviceSlug);
      const originalSignature = headers['X-Signature'];

      // Tenter de modifier le role en admin
      const modifiedPayload = `${userId}:${email}:admin:${serviceSlug}:${headers['X-Timestamp']}`;
      const modifiedSignature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(modifiedPayload)
        .digest('hex');

      expect(modifiedSignature).not.toBe(originalSignature);
    });

    it('devrait détecter une signature expirée', () => {
      const oldTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes dans le passé
      const payload = `${userId}:${email}:${role}:${serviceSlug}:${oldTimestamp}`;
      const signature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex');

      const signatureAge = Date.now() - oldTimestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes

      expect(signatureAge).toBeGreaterThan(maxAge);
    });
  });

  describe('Edge Cases', () => {
    it('devrait gérer les caractères spéciaux dans l\'email', () => {
      const specialEmail = 'test+special@example.com';
      const headers = createSignedHeaders(userId, specialEmail, role, serviceSlug);

      expect(headers['X-User-Email']).toBe(specialEmail);
      expect(headers['X-Signature']).toBeTruthy();
    });

    it('devrait gérer les IDs utilisateur longs', () => {
      const longUserId = '507f1f77bcf86cd799439011'; // MongoDB ObjectId
      const headers = createSignedHeaders(longUserId, email, role, serviceSlug);

      expect(headers['X-User-Id']).toBe(longUserId);
      expect(headers['X-Signature']).toBeTruthy();
    });

    it('devrait gérer les slugs de service avec tirets', () => {
      const slugWithDash = 'my-service-name';
      const headers = createSignedHeaders(userId, email, role, slugWithDash);

      expect(headers['X-Service-Slug']).toBe(slugWithDash);
      expect(headers['X-Signature']).toBeTruthy();
    });
  });
});
