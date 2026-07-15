import { useState } from 'react';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Custom Hook
import { useAiSearch } from '../hooks/useAiSearch';

export default function AiSearchPage() {
    // Récupère toute la logique et l'état depuis notre hook
    const { authors, suggestedBooks, loadingLibrary, loadingLlm, error, searchWithAi } = useAiSearch();

    const [userPrompt, setUserPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchWithAi(userPrompt);
    };

    // Affichage du chargement initial global
    if (loadingLibrary) {
        return <LoadingSpinner message="Initialisation du système et chargement des connaissances..." />;
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center mb-5">
                <div className="col-md-8 text-center">
                    <h2 className="fw-bold mb-2">🤖 Recherche avec IA</h2>
                    <p className="text-muted mb-4">Décrivez ce que vous aimez et trouvez la lecture parfaite.</p>

                    <form onSubmit={handleSubmit} className="d-flex gap-2 shadow-sm p-3 bg-light rounded border">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Ex: Un roman policier avec beaucoup de suspense..."
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            disabled={loadingLlm}
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg px-4 d-flex align-items-center"
                            disabled={loadingLlm}
                        >
                            {loadingLlm ? 'Analyse...' : 'Chercher'}
                        </button>
                    </form>

                    {error && <div className="alert alert-danger mt-3 shadow-sm">{error}</div>}
                </div>
            </div>

            {loadingLlm && (
                <div className="my-5">
                    <LoadingSpinner message="L'IA prépare vos recommandations (cela peut prendre quelques secondes)..." />
                </div>
            )}

            {!loadingLlm && suggestedBooks.length > 0 && (
                <div className="animate-fade-in">
                    <h4 className="fw-bold mb-4 border-bottom pb-2 text-secondary">✨ Suggestions de livres</h4>
                    <div className="row g-4">
                        {suggestedBooks.map(book => {
                            const author = authors.find(a => a.id === book.authorId);
                            return (
                                <div className="col-md-4 d-flex flex-column" key={book.id}>
                                    <BookCard
                                        book={book}
                                        authorName={author ? author.name : 'Auteur inconnu'}
                                    />

                                    {book.aiReason && (
                                        <div className="mt-2 p-3 alert alert-info small border-info flex-grow-1 shadow-sm">
                                            <strong>Pourquoi ce livre ?</strong> <br />
                                            <span className="text-dark">{book.aiReason}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}