import { useState } from 'react';
import type { Author } from '../types/library';

interface AddBookFormProps {
    authors: Author[];
    onAdd: (title: string, authorId: number, year: number, summary: string) => Promise<void>;
    onCancel: () => void;
}

export default function AddBookForm({ authors, onAdd, onCancel }: AddBookFormProps) {
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorId) return alert("Veuillez sélectionner un auteur");

        setLoading(true);
        try {
            await onAdd(title, Number(authorId), year, summary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 shadow-sm bg-light mb-4 border-success">
            <h5 className="fw-bold mb-3 text-success">➕ Ajouter un livre</h5>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label small fw-semibold">Nom du livre (Titre)</label>
                    <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="row g-3 mb-3">
                    <div className="col-md-8">
                        <label className="form-label small fw-semibold">Auteur</label>
                        <select className="form-select" value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
                            <option value="">-- Sélectionner l'auteur --</option>
                            {authors.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* 4. Le nouveau champ d'input pour l'année */}
                    <div className="col-md-4">
                        <label className="form-label small fw-semibold">Année de publication</label>
                        <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            required
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-semibold">Contenu (Résumé du livre)</label>
                    <textarea className="form-control" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} required />
                </div>
                <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={onCancel} disabled={loading}>Annuler</button>
                    <button type="submit" className="btn btn-sm btn-success" disabled={loading}>
                        {loading ? 'Création...' : 'Valider'}
                    </button>
                </div>
            </form>
        </div>
    );
}