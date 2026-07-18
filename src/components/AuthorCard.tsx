import type { Author } from '../types/library';

interface AuthorCardProps {
    author: Author;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    onShowBooks: (id: number) => void;
}

export default function AuthorCard({ author, onDelete, onEdit, onShowBooks }: AuthorCardProps) {

    // Formatage simple de la date pour un rendu plus propre à l'écran (Ex : 25 juin 1903)
    const formattedDate = new Date(author.birthDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold text-dark mb-1">{author.name}</h5>
                <span className="badge bg-secondary align-self-start mb-3">{author.country}</span>

                <p className="card-text text-muted small mb-3">
                    📅 Né(e) le : {formattedDate}
                </p>

                <p className="card-text small mb-4">
                    📚 Livres enregistrés : <span className="fw-bold">{author.bookIds.length}</span>
                </p>

                {/* Boutons d'actions repoussés vers le bas de la carte */}
                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">

                    {/* 1. Logique pour le bouton "Voir Livres" */}
                    {author.bookIds.length > 0 ? (
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => onShowBooks(author.id)}
                        >
                            {author.bookIds.length === 1 ? "Voir Livre" : "Voir Livres"}
                        </button>
                    ) : (
                        // Placeholder discret pour garder les autres boutons alignés à droite
                        <span className="text-muted small fst-italic">Aucun Livre</span>
                    )}

                    <div className="d-flex gap-1">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEdit(author.id)}
                            aria-label="Éditer"
                        >
                            ✏️
                        </button>

                        {/* 2. Logique pour le bouton "Supprimer" (uniquement si 0 livre) */}
                        {author.bookIds.length === 0 && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(author.id)}
                                aria-label="Supprimer"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}