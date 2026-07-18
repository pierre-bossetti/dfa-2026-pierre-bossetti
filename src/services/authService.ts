export const authService = {
    login: async (username: string, password: string): Promise<string> => {
        let response;

        try {
            response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({ username, password })
            });
        } catch (error) {
            // Le fetch plante complètement si le serveur est éteint
            throw new Error("Impossible de joindre le serveur. Le backend est-il démarré ?");
        }

        if (!response.ok) {
            // Si le serveur répond, on vérifie le code d'erreur HTTP
            if (response.status === 401 || response.status === 403) {
                throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
            } else {
                // Erreur 500, 502, 503, etc. (ex: la base de données n'est pas prête)
                throw new Error("Le backend n'est pas encore prêt. Veuillez patienter quelques secondes.");
            }
        }

        const data = await response.json();
        return data.token; // On extrait et on renvoie juste le token
    }
};