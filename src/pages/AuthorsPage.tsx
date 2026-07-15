import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Author, CreateAuthorDto } from '../types/library';
import AuthorCard from '../components/AuthorCard';
import AddAuthorForm from '../components/AddAuthorForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage'; // Import du composant partagé

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    // Gestion de l'asynchrone et des pannes
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getAuthors() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/authors', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*',
                        'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('dfa_library_token');
                    window.location.href = '/login';
                    return;
                }

                if (!response.ok) throw new Error("Impossible de charger les auteurs");

                const data = await response.json();
                if (Array.isArray(data)) {
                    setAuthors(data);
                }
            } catch (err) {
                console.error("Erreur attrapée :", err);
                setError("Impossible de joindre le serveur. Le backend est hors ligne.");
            } finally {
                setLoading(false);
            }
        }

        getAuthors();
    }, []);

    async function handleDeleteAuthor(id: number) {
        if (!confirm("Voulez-vous vraiment supprimer cet auteur ?")) return;

        try {
            const response = await fetch(`/api/authors/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            setAuthors(prevAuthors => prevAuthors.filter(author => author.id !== id));
            alert("Auteur supprimé avec succès !");
        } catch {
            alert(`Impossible de supprimer : L'auteur est lié à un livre et ne peut pas être supprimé.`);
        }
    }

    function handleEditClick(id: number) {
        const authorToEdit = authors.find(a => a.id === id);
        if (authorToEdit) {
            setEditingAuthor(authorToEdit);
            setIsFormOpen(true);
        }
    }

    async function handleSaveAuthor(authorData: CreateAuthorDto) {
        setSaving(true); // On lance l'indicateur de chargement
        const isEditing = editingAuthor !== null;
        const url = isEditing ? `/api/authors/${editingAuthor.id}` : '/api/authors';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
                },
                body: JSON.stringify(authorData)
            });

            if (!response.ok) throw new Error("Erreur de sauvegarde");

            const savedAuthor = await response.json();

            if (isEditing) {
                setAuthors(prev => prev.map(a => a.id === editingAuthor.id ? savedAuthor : a));
            } else {
                setAuthors(prev => [...prev, savedAuthor]);
            }

            setIsFormOpen(false);
            setEditingAuthor(null);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement de l'auteur.");
        } finally {
            setSaving(false); // Fin de la sauvegarde
        }
    }

    const navigate = useNavigate();

    function handleShowAuthorBooks(id: number) {
        // Redirige vers /books?authorId=1
        navigate(`/books?authorId=${id}`);
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Gestion des Auteurs</h2>
                {/* Désactivé si le serveur est offline */}
                <button
                    className="btn btn-primary"
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    disabled={!!error}
                >
                    {isFormOpen ? "Voir la liste" : "+ Ajouter un auteur"}
                </button>
            </div>

            {/* Affichage adaptatif des formulaires et des listes d'auteurs */}
            {saving ? (
                <LoadingSpinner message="Enregistrement de l'auteur en cours..." />
            ) : loading ? (
                <LoadingSpinner message="Chargement des auteurs..." />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : isFormOpen ? (
                <AddAuthorForm
                    onAdd={handleSaveAuthor}
                    onCancel={() => { setIsFormOpen(false); setEditingAuthor(null); }}
                    initialData={editingAuthor}
                />
            ) : authors.length === 0 ? (
                <div className="text-center py-5 text-muted bg-light rounded border border-dashed my-4">
                    <div className="fs-1 mb-3">👤</div>
                    <h4 className="fw-semibold">Aucun auteur enregistré</h4>
                    <p>Commencez par ajouter un auteur à votre bibliothèque.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {authors.map(author => (
                        <div className="col-md-4" key={author.id}>
                            <AuthorCard
                                author={author}
                                onEdit={handleEditClick}
                                onDelete={(id) => handleDeleteAuthor(id)}
                                onShowBooks={(id) => handleShowAuthorBooks(id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}