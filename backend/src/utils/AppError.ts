// src/utils/AppError.ts
class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    // Le statut est 'fail' pour les erreurs 4xx et 'error' pour les 5xx
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // On marque cette erreur comme "opérationnelle" (prévisible)
    this.isOperational = true;

    // Capture la stack trace, en excluant le constructeur de l'erreur
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;