import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Composants
import BookCard from '../components/BookCard';
import SearchBookForm from '../components/SearchBookForm';
import AddBookForm from '../components/AddBookForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Custom Hooks
import { useBooks } from '../hooks/useBooks';
import { useAuthors } from "../hooks/useAuthors.ts";

export default function BooksPage() {
    const [searchParams] = useSearchParams();
    const authorIdFilter = searchParams.get('authorId');

    // 1. Déstructuration des hooks : on récupère la data et les fonctions
    const { books, loadingBooks, saving, error, searchBooks, addBook, deleteBook } = useBooks(authorIdFilter);
    const { authors } = useAuthors();

    // 2. État lié à l'affichage du formulaire
    const [activeForm, setActiveForm] = useState<'none' | 'search' | 'add'>('none');

    // Fonction pour fermer la recherche et réinitialiser la liste des livres
    const handleCloseSearch = () => {
        setActiveForm('none');
        searchBooks('', authorIdFilter || ''); // Relance une recherche vide (reset)
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Gestion des Livres</h2>
                <div className="d-flex gap-2">
                    <button
                        className={`btn ${activeForm === 'search' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => activeForm === 'search' ? handleCloseSearch() : setActiveForm('search')}
                        disabled={!!error}
                    >
                        🔍 Rechercher
                    </button>
                    <button
                        className={`btn ${activeForm === 'add' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setActiveForm(activeForm === 'add' ? 'none' : 'add')}
                        disabled={!!error}
                    >
                        ➕ Ajouter
                    </button>
                </div>
            </div>

            {/* Formulaire de recherche branché au hook */}
            {activeForm === 'search' && !error && (
                <SearchBookForm
                    authors={authors}
                    onSearch={searchBooks}
                    onCancel={handleCloseSearch}
                />
            )}

            {/* Formulaire d'ajout branché au hook */}
            {activeForm === 'add' && !error && (
                <AddBookForm
                    authors={authors}
                    onAdd={(title, authorId, year, content) =>
                        addBook(
                            { title, authorId, year, content },
                            () => setActiveForm('none') // Callback onSuccess
                        )
                    }
                    onCancel={() => setActiveForm('none')}
                />
            )}

            {/* Logique d'affichage multi-état */}
            {saving ? (
                <LoadingSpinner message="Création du livre en cours..." />
            ) : loadingBooks ? (
                <LoadingSpinner message="Récupération de la bibliothèque..." />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : books.length === 0 ? (
                <div className="text-center py-5 text-muted bg-light rounded border border-dashed my-4">
                    <div className="fs-1 mb-3">📚</div>
                    <h4 className="fw-semibold">Aucun livre disponible</h4>
                    <p>La bibliothèque est vide ou aucun livre ne correspond à votre recherche.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {books.map(book => {
                        const author = authors.find(a => a.id === book.authorId);
                        return (
                            <div className="col-md-4" key={book.id}>
                                <BookCard
                                    book={book}
                                    authorName={author ? author.name : 'Chargement...'}
                                    onDelete={deleteBook}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}