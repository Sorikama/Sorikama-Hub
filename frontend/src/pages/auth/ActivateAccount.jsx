/**
 * Page d'activation de compte
 * L'utilisateur définit son mot de passe lors de la première connexion
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import * as activationService from '../../services/activationService';

export default function ActivateAccount() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [userData, setUserData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // Vérifier le token au chargement
    useEffect(() => {
        checkToken();
    }, [token]);

    const checkToken = async () => {
        try {
            setLoading(true);
            const response = await activationService.checkActivationToken(token);

            if (response.success) {
                setTokenValid(true);
                setUserData(response.data);
            }
        } catch (error) {
            setTokenValid(false);
            setErrors({ token: error.response?.data?.message || 'Token invalide ou expiré' });
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('Au moins 8 caractères');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Une lettre majuscule');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Une lettre minuscule');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Un chiffre');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Un caractère spécial (!@#$%^&*)');
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                newErrors.password = 'Le mot de passe doit contenir : ' + passwordErrors.join(', ');
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Activation
        try {
            setValidating(true);
            const response = await activationService.activateAccount(
                token,
                formData.password,
                formData.confirmPassword
            );

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.'
                        }
                    });
                }, 3000);
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || 'Erreur lors de l\'activation du compte'
            });
        } finally {
            setValidating(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        const errors = validatePassword(password);
        const strength = ((5 - errors.length) / 5) * 100;

        if (strength < 40) return { strength, label: 'Faible', color: 'bg-red-500' };
        if (strength < 80) return { strength, label: 'Moyen', color: 'bg-yellow-500' };
        return { strength, label: 'Fort', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Vérification du lien d'activation...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        Lien invalide
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        {errors.token || 'Ce lien d\'activation est invalide ou a expiré.'}
                    </p>
                    <Link
                        to="/login"
                        className="block w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors text-center font-medium"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-slideUp">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        Compte activé !
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        Votre compte a été activé avec succès. Vous allez être redirigé vers la page de connexion...
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FiLock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Activez votre compte
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bonjour <strong>{userData?.firstName} {userData?.lastName}</strong> !<br />
                        Définissez votre mot de passe pour activer votre compte.
                    </p>
                </div>

                {/* Formulaire */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Entrez votre mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Barre de force du mot de passe */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Force du mot de passe
                                        </span>
                                        <span className={`text-xs font-semibold ${passwordStrength.strength < 40 ? 'text-red-600' :
                                            passwordStrength.strength < 80 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Confirmez votre mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Erreur générale */}
                        {errors.submit && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Bouton */}
                        <button
                            type="submit"
                            disabled={validating}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                            {validating ? 'Activation en cours...' : 'Activer mon compte'}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            <strong>Conseil :</strong> Utilisez un mot de passe fort avec au moins 8 caractères,
                            incluant des majuscules, minuscules, chiffres et caractères spéciaux.
                        </p>
                    </div>
                </div>

                {/* Lien retour */}
                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
