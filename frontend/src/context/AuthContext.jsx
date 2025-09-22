// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Pour la persistance de session
    const navigate = useNavigate();

    // Au chargement de l'app, vérifier si l'utilisateur est déjà connecté (persistance)
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const accessToken = localStorage.getItem('accessToken');

                if (storedUser && accessToken) {
                    setUser(JSON.parse(storedUser));
                    // L'intercepteur (api.js) s'occupe de mettre le token dans les futures requêtes
                }
            } catch (error) {
                console.error("Échec de l'initialisation de l'authentification:", error);
                // En cas d'erreur (ex: localStorage corrompu), on nettoie
                localStorage.clear();
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, []);

    // -- FONCTIONS DE GESTION DES TOKENS --

    const setAuthData = (user, tokens) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        setUser(user);
        // L'intercepteur `api.js` utilisera ces tokens pour les prochaines requêtes
    };

    const clearAuthData = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    // -- FONCTIONS D'AUTHENTIFICATION --

    const login = async ({ email, password }) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log("this current response", response);

            const { user, tokens } = response?.data?.data;
            console.log("this is user and tokens", user, tokens);

            setAuthData(user, tokens);
            toast.success('Connexion réussie !');
            navigate('/dashboard');
        } catch (error) {
            console.log("this is error", error);
            const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect.';
            toast.error(errorMessage);
            throw error; // Permet au composant de savoir que l'appel a échoué
        }
    };

    const signup = async (userData) => {
        try {
            const { confirmPassword, ...apiData } = userData;
            const response = await api.post('/auth/register', apiData);

            toast.success(response.data.message || 'Inscription réussie ! Veuillez vérifier votre email.');
            const verificationToken = response?.data?.data?.verificationToken;
            navigate(`/verify?token=${verificationToken}`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
            toast.error(errorMessage);
            throw error;
        }
    };

    const verify = async (verificationToken, verificationCode) => {
        try {
            const response = await api.post('/auth/verify', { verificationToken, code: verificationCode });
            console.log('this is list', response);

            const { user, tokens } = response?.data?.data;
            console.log("this is user and tokens", user, tokens);

            setAuthData(user, tokens);
            toast.success('Votre compte a été vérifié avec succès !');
            navigate('/dashboard');
        } catch (error) {
            console.log("this is error", error);

            const errorMessage = error.response?.data?.message || 'Code de vérification invalide ou expiré.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                // Informe le backend d'invalider le token
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error("Échec de la déconnexion côté serveur, mais déconnexion locale en cours...", error);
        } finally {
            // Quoi qu'il arrive (succès ou échec), on nettoie le client
            clearAuthData();
            toast.info('Vous avez été déconnecté.');
            navigate('/login');
        }
    };

    // -- FONCTIONS DE RÉINITIALISATION DU MOT DE PASSE --

    const forgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Un email de réinitialisation vous a été envoyé.');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la demande.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const resetPassword = async (token, password) => {
        try {
            await api.post(`/auth/reset-password?token=${token}`, { password });
            toast.success('Votre mot de passe a été réinitialisé avec succès !');
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Le lien est invalide ou a expiré.';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Mettre à jour le profil
    const updateProfile = async (profileData) => {
        try {
            const response = await api.patch('/auth/update-me', profileData);
            const updatedUser = response.data;

            // Mettre à jour l'état local et le localStorage
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Profil mis à jour avec succès !');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil.';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Mettre à jour le mot de passe
    const updatePassword = async (passwordData) => {
        try {
            await api.patch('/auth/update-password', passwordData);
            toast.success('Mot de passe mis à jour avec succès !');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Valeur fournie par le contexte
    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        verify,
        forgotPassword,
        resetPassword,
        updateProfile,
        updatePassword,
    };

    // Ne rend rien tant que le chargement initial n'est pas terminé
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);