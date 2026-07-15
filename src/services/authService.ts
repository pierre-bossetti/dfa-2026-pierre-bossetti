export const authService = {
    login: async (username: string, password: string): Promise<string> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
        }

        const data = await response.json();
        return data.token; // On extrait et on renvoie juste le token
    }
};