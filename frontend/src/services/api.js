import axios from 'axios';

// Création de l'instance de base d'axios
const api = axios.create({
    baseURL: 'http://localhost:4000/api/v1', // URL de votre backend
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
  INTERCEPTEUR DE REQUÊTE (Request Interceptor)
*/
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        // On définit une liste de routes qui n'ont PAS besoin du token
        const publicRoutes = [
            '/auth/login',
            '/auth/register',
            '/auth/refresh-token',
            '/auth/forgot-password',
            // La route reset-password est aussi publique mais on peut l'omettre car elle inclut un token dans l'URL
        ];

        // On ajoute le token SEULEMENT si la route n'est pas publique ET si un token existe
        if (token && !publicRoutes.includes(config.url)) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        console.log("this log connect", config);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/*
  INTERCEPTEUR DE RÉPONSE (Response Interceptor)
*/
api.interceptors.response.use(
    (response) => {
        // Si la réponse est réussie, on la retourne telle quelle
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // S'assurer que error.response existe avant de lire le status
        if (!error.response) {
            console.error("Erreur réseau ou serveur inaccessible.", error);
            return Promise.reject(error);
        }

        // On vérifie si l'erreur est un 401 et qu'il ne s'agit pas déjà d'une tentative de rafraîchissement
        if (error.response.status === 401 && originalRequest.url === '/auth/refresh-token') {
            console.error("Refresh token a échoué. Déconnexion.");
            localStorage.clear();
            window.location.href = '/login'; // Redirection forcée
            return Promise.reject(error);
        }

        // Si c'est un 401 et qu'on n'a pas encore réessayé
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                console.error("Aucun refresh token trouvé. Déconnexion.");
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Tenter d'obtenir de nouveaux tokens en utilisant le refreshToken
                const rs = await axios.post('http://localhost:4000/api/v1/auth/refresh-token', {
                    refreshToken,
                });

                const { tokens, user } = rs?.data?.data;

                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;

                return api(originalRequest);

            } catch (_error) {
                console.error("Impossible de rafraîchir le token.", _error);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(_error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
