import type { Author, CreateAuthorDto } from '../types/library';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'accept': '*/*',
    'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
});

// Utilitaire pour gérer la réponse et l'expiration du token (401)
const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        localStorage.removeItem('dfa_library_token');
        window.location.href = '/login';
        throw new Error("Session expirée");
    }
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Erreur serveur");
        throw new Error(errorText);
    }

    // Si la réponse a du contenu JSON, on le retourne
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return null;
};

export const authorService = {
    getAll: async (): Promise<Author[]> => {
        const res = await fetch('/api/authors', { method: 'GET', headers: getHeaders() });
        return handleResponse(res);
    },

    create: async (data: CreateAuthorDto): Promise<Author> => {
        const res = await fetch('/api/authors', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    update: async (id: number, data: CreateAuthorDto): Promise<Author> => {
        const res = await fetch(`/api/authors/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    delete: async (id: number): Promise<void> => {
        const res = await fetch(`/api/authors/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        await handleResponse(res);
    }
};