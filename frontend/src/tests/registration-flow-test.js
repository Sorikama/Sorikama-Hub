// Script de test pour vérifier le flux d'inscription
// Ce script est destiné aux tests manuels

// Étapes pour tester:
// 1. Vérification de la disponibilité d'un email
//    - Ouvrir la console du navigateur
//    - Exécuter: authService.checkEmailAvailability("test@example.com")
//    - Vérifier que la requête est bien envoyée en POST
//    - Vérifier la réponse (true si disponible, false si déjà utilisé)
//
// 2. Tester l'inscription complète
//    - Accéder à la page d'inscription
//    - Remplir le formulaire avec un email non utilisé
//    - Soumettre le formulaire
//    - Vérifier la redirection vers la page de création de boutique
//
// 3. Tester la gestion des erreurs
//    - Essayer de s'inscrire avec un email déjà utilisé
//    - Vérifier que le message d'erreur "Cet email est déjà utilisé" s'affiche
//    - Vérifier dans la console que la requête POST de vérification d'email renvoie {available: false}

console.log('=== Test du flux d\'inscription ===');
console.log('Ouvrez la console du navigateur et suivez ces étapes:');
console.log('');
console.log('1. Test de vérification d\'email:');
console.log('   - Exécutez dans la console: import authService from \'./services/authService\'; authService.checkEmailAvailability("test@example.com")');
console.log('   - Vérifiez que la requête est envoyée en POST à /api/auth/check-email');
console.log('   - Vérifiez la réponse dans la console');
console.log('');
console.log('2. Test d\'inscription complète:');
console.log('   - Accédez à /auth/register');
console.log('   - Remplissez le formulaire avec un nouvel email');
console.log('   - Vérifiez la redirection vers /dashboard/create-store');
console.log('');
console.log('3. Test avec email existant:');
console.log('   - Essayez de vous inscrire avec un email déjà utilisé');
console.log('   - Vérifiez le message d\'erreur "Cet email est déjà utilisé"');
console.log('');
console.log('4. Vérification des logs backend:');
console.log('   - Vérifiez les logs du backend pour confirmer que les requêtes POST sont bien traitées');
