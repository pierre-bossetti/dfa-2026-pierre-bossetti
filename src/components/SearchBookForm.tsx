import { useState } from 'react';
import type { Author } from '../types/library';

interface SearchBookFormProps {
    authors: Author[];
    onSearch: (title: string, authorId: string) => void;
    onCancel: () => void;
}

export default function SearchBookForm({ authors, onSearch, onCancel }: SearchBookFormProps) {
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(title, authorId);
    };

    return (
        <div className="card p-4 shadow-sm bg-light mb-4 border-primary">
            <h5 className="fw-bold mb-3">🔍 Rechercher un livre</h5>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold">Titre du livre</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ex: L'Étranger"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold">Filtrer par auteur</label>
                        <select
                            className="form-select"
                            value={authorId}
                            onChange={(e) => setAuthorId(e.target.value)}
                        >
                            <option value="">-- Tous les auteurs --</option>
                            {authors.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="d-flex gap-2 justify-content-end mt-3">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={onCancel}>Annuler</button>
                    <button type="submit" className="btn btn-sm btn-primary">Chercher</button>
                </div>
            </form>
        </div>
    );
}