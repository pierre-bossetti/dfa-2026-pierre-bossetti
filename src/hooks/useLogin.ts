import { useState } from 'react';
import { authService } from '../services/authService';

export function useLogin(onLoginSuccess: (token: string) => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await authService.login(username, password);
            onLoginSuccess(token); // On transmet le token à l'application
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Une erreur est survenue lors de la connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
}