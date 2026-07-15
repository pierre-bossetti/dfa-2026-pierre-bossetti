import { useState, useEffect } from 'react';
import type { Book, CreateBookDto } from '../types/library';
import { bookService } from '../services/bookService';

export function useBooks(authorIdFilter: string | null) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chargement initial
    useEffect(() => {
        async function loadBooks() {
            setLoadingBooks(true);
            try {
                const data = await bookService.getAll(authorIdFilter);
                setBooks(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur de connexion");
            } finally {
                setLoadingBooks(false);
            }
        }
        loadBooks();
    }, [authorIdFilter]);

    // Recherche
    const searchBooks = async (title: string, authorId: string) => {
        setLoadingBooks(true);
        try {
            const data = await bookService.search(title, authorId);
            setBooks(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Impossible d'effectuer la recherche. Le serveur est inaccessible.");
        } finally {
            setLoadingBooks(false);
        }
    };

    // Ajouter un livre
    const addBook = async (bookData: CreateBookDto, onSuccess: () => void) => {
        setSaving(true);
        try {
            const newBook = await bookService.create(bookData);
            setBooks(prev => [...prev, newBook].sort((a, b) => a.title.localeCompare(b.title)));
            onSuccess(); // Appelle le callback pour fermer le formulaire sur la page
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la création du livre. Le serveur est peut-être down.");
        } finally {
            setSaving(false);
        }
    };

    // Supprimer un livre
    const deleteBook = async (id: number) => {
        if (!confirm("Supprimer ce livre de la bibliothèque ?")) return;
        try {
            await bookService.delete(id);
            setBooks(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error(err);
            alert("Impossible de supprimer le livre.");
        }
    };

    // On renvoie un objet avec tout ce dont la page aura besoin
    return { books, loadingBooks, saving, error, searchBooks, addBook, deleteBook };
}