import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Author } from '../types/library';

// Composants
import AuthorCard from '../components/AuthorCard';
import AddAuthorForm from '../components/AddAuthorForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Custom Hooks
import { useAuthors } from '../hooks/useAuthors';

export default function AuthorsPage() {
    const navigate = useNavigate();

    // 1. Déstructuration de la logique métier via le hook
    const { authors, loading, saving, error, saveAuthor, deleteAuthor } = useAuthors();

    // 2. États liés à l'interface visuelle (UI)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    // Fonctions de navigation et de gestion des fenêtres
    function handleEditClick(id: number) {
        const authorToEdit = authors.find(a => a.id === id);
        if (authorToEdit) {
            setEditingAuthor(authorToEdit);
            setIsFormOpen(true);
        }
    }

    function handleShowAuthorBooks(id: number) {
        navigate(`/books?authorId=${id}`);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingAuthor(null);
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Gestion des Auteurs</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    disabled={!!error}
                >
                    {isFormOpen ? "Voir la liste" : "+ Ajouter un auteur"}
                </button>
            </div>

            {/* Affichage adaptatif */}
            {saving ? (
                <LoadingSpinner message="Enregistrement de l'auteur en cours..." />
            ) : loading ? (
                <LoadingSpinner message="Chargement des auteurs..." />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : isFormOpen ? (
                <AddAuthorForm
                    onAdd={(authorData) =>
                        saveAuthor(
                            authorData,
                            editingAuthor ? editingAuthor.id : null,
                            closeForm
                        )
                    }
                    onCancel={closeForm}
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
                                onDelete={deleteAuthor}
                                onShowBooks={handleShowAuthorBooks}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}