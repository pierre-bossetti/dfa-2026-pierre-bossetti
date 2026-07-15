import type { Book, CreateBookDto } from '../types/library';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
});

export const bookService = {
    getAll: async (authorIdFilter?: string | null): Promise<Book[]> => {
        let url = '/api/books?sortBy=title&direction=asc';
        if (authorIdFilter) url += `&authorId=${authorIdFilter}`;

        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error("Le serveur a rencontré un problème.");
        return res.json();
    },

    search: async (title: string, authorId: string): Promise<Book[]> => {
        let url = `/api/books?sortBy=title&direction=asc`;
        if (title) url += `&title=${encodeURIComponent(title)}`;
        if (authorId) url += `&authorId=${authorId}`;

        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error("Erreur de recherche.");
        return res.json();
    },

    create: async (bookData: CreateBookDto): Promise<Book> => {
        const res = await fetch('/api/books', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookData)
        });
        if (!res.ok) throw new Error("Erreur d'enregistrement.");
        return res.json();
    },

    delete: async (id: number): Promise<void> => {
        const res = await fetch(`/api/books/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Erreur de suppression.");
    }
};