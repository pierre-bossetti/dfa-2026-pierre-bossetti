import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Book, Author, CreateBookDto } from '../types/library';
import BookCard from '../components/BookCard';
import SearchBookForm from '../components/SearchBookForm';
import AddBookForm from '../components/AddBookForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Gestions des chargements
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [saving, setSaving] = useState(false); // Spinner pour la création

    const [activeForm, setActiveForm] = useState<'none' | 'search' | 'add'>('none');
    const [searchParams] = useSearchParams();
    const authorIdFilter = searchParams.get('authorId');

    // Chargement des Livres
    useEffect(() => {
        async function fetchBooks() {
            setLoadingBooks(true);
            setError(null);
            try {
                let url = '/api/books?sortBy=title&direction=asc';
                if (authorIdFilter) url += `&authorId=${authorIdFilter}`;

                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}` }});

                if (!res.ok) throw new Error("Le serveur a rencontré un problème.");
                setBooks(await res.json());
            } catch (err) {
                console.error(err);
                setError("Impossible de joindre le serveur. Le backend est hors ligne.");
            } finally {
                setLoadingBooks(false);
            }
        }
        fetchBooks();
    }, [authorIdFilter]);

    // Chargement des Auteurs
    useEffect(() => {
        async function fetchAuthors() {
            try {
                const res = await fetch('/api/authors', { headers: { 'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}` }});
                if (res.ok) setAuthors(await res.json());
            } catch (err) {
                console.error(err);
            }
        }
        fetchAuthors();
    }, []);

    const handleSearch = async (title: string, authorId: string) => {
        setLoadingBooks(true);
        setError(null);
        try {
            let url = `/api/books?sortBy=title&direction=asc`;
            if (title) url += `&title=${encodeURIComponent(title)}`;
            if (authorId) url += `&authorId=${authorId}`;

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}` } });
            if (!res.ok) throw new Error("Erreur de recherche.");
            setBooks(await res.json());
        } catch (error) {
            console.error(error);
            setError("Impossible d'effectuer la recherche. Le serveur est inaccessible.");
        } finally {
            setLoadingBooks(false);
        }
    };

    const handleAddBook = async (bookData: CreateBookDto) => {
        setSaving(true); // On active le spinner de sauvegarde
        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}`
                },
                body: JSON.stringify(bookData)
            });
            if (!res.ok) throw new Error("Erreur d'enregistrement.");
            const newBook = await res.json();
            setBooks(prev => [...prev, newBook].sort((a, b) => a.title.localeCompare(b.title)));
            setActiveForm('none');
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création du livre. Le serveur est peut-être down.");
        } finally {
            setSaving(false); // On coupe le spinner de sauvegarde
        }
    };

    const handleDeleteBook = async (id: number) => {
        if (!confirm("Supprimer ce livre de la bibliothèque ?")) return;
        try {
            const res = await fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('dfa_library_token')}` }
            });
            if (!res.ok) throw new Error("Erreur de suppression.");
            setBooks(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
            alert("Impossible de supprimer le livre.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Gestion des Livres</h2>
                <div className="d-flex gap-2">
                    {/* Grisés si le serveur est down (error !== null) */}
                    <button
                        className={`btn ${activeForm === 'search' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveForm(activeForm === 'search' ? 'none' : 'search')}
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

            {activeForm === 'search' && !error && <SearchBookForm authors={authors} onSearch={handleSearch} onCancel={() => setActiveForm('none')} />}
            {activeForm === 'add' && !error && (
                <AddBookForm
                    authors={authors}
                    onAdd={(title, authorId, content) =>
                        handleAddBook({
                            title,
                            authorId,
                            content,
                            year: new Date().getFullYear()
                        })
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
                                <BookCard book={book} authorName={author ? author.name : 'Chargement...'} onDelete={handleDeleteBook} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}