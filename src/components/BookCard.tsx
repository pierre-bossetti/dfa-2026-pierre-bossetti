import { useState } from 'react';
import type { Book } from '../types/library';

interface BookCardProps {
    book: Book;
    authorName: string;
    onDelete?: (id: number) => void;
}

export default function BookCard({ book, authorName, onDelete }: BookCardProps) {
    const [showSummary, setShowSummary] = useState(false);

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title fw-bold mb-1">{book.title}</h5>

                    {/* 2. Affiche le bouton UNIQUEMENT si onDelete est fourni 👇 */}
                    {onDelete && (
                        <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => onDelete(book.id)}
                            aria-label="Supprimer le livre"
                        >
                            🗑️
                        </button>
                    )}
                </div>
                <h6 className="card-subtitle mb-2 text-muted">{authorName || 'Auteur inconnu'}</h6>
                <p className="card-text small text-secondary mt-2">
                    {book.summary}
                </p>
                <p className="card-text small text-secondary mt-2">
                    📅 Publication : <span className="fw-semibold">{book.year || 'N/A'}</span>
                </p>

                <div className="mt-auto pt-3 border-top">
                    <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={() => setShowSummary(!showSummary)}
                    >
                        {showSummary ? 'Cacher contenu' : 'Lire contenu'}
                    </button>
                </div>

                {showSummary && (
                    <div className="mt-3 p-2 bg-light rounded small border">
                        {book.content || "Aucun contenu disponible pour ce livre."}
                    </div>
                )}
            </div>
        </div>
    );
}