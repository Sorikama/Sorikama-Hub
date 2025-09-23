// src/types/nodemailer.d.ts
import { Transporter } from 'nodemailer';

// On déclare une modification du scope global
declare global {
  // On cible le module 'nodemailer' pour l'étendre
  namespace nodemailer {
    // On étend l'interface Transporter existante
    interface Transporter {
      /**
       * Rend un template d'email. Cette méthode est ajoutée par le plugin.
       */
      render(
        template: string,
        context: any,
        callback: (err: Error | null, html?: string) => void
      ): void;
    }
  }
}

// On exporte un type vide pour s'assurer que le fichier est traité comme un module
export {};