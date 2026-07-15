import { useState, useEffect } from 'react';
import type { Author, CreateAuthorDto } from '../types/library';
import { authorService } from '../services/authorService';

export function useAuthors() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chargement initial
    useEffect(() => {
        async function loadAuthors() {
            setLoading(true);
            setError(null);
            try {
                const data = await authorService.getAll();
                if (Array.isArray(data)) {
                    setAuthors(data);
                }
            } catch (err) {
                console.error("Erreur attrapée :", err);
                // Si ce n'est pas une redirection 401, on affiche l'erreur
                if (err instanceof Error && err.message !== "Session expirée") {
                    setError("Impossible de joindre le serveur. Le backend est hors ligne.");
                }
            } finally {
                setLoading(false);
            }
        }
        loadAuthors();
    }, []);

    // Ajout ou Modification (Géré intelligemment)
    const saveAuthor = async (authorData: CreateAuthorDto, editId: number | null, onSuccess: () => void) => {
        setSaving(true);
        try {
            if (editId) {
                // Mode Édition (PUT)
                const updatedAuthor = await authorService.update(editId, authorData);
                setAuthors(prev => prev.map(a => a.id === editId ? updatedAuthor : a));
            } else {
                // Mode Création (POST)
                const newAuthor = await authorService.create(authorData);
                setAuthors(prev => [...prev, newAuthor]);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement de l'auteur.");
        } finally {
            setSaving(false);
        }
    };

    // Suppression
    const deleteAuthor = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cet auteur ?")) return;
        try {
            await authorService.delete(id);
            setAuthors(prev => prev.filter(author => author.id !== id));
            alert("Auteur supprimé avec succès !");
        } catch {
            alert(`Impossible de supprimer : L'auteur est lié à un livre et ne peut pas être supprimé.`);
        }
    };

    return { authors, loading, saving, error, saveAuthor, deleteAuthor };
}