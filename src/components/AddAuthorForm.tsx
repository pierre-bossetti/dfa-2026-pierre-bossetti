import {useEffect, useState} from 'react';
import type { CreateAuthorDto, Author } from '../types/library';

interface AddAuthorFormProps {
    onAdd: (newAuthorData: CreateAuthorDto) => Promise<void>;
    onCancel: () => void;
    initialData?: Author | null;
}

export default function AddAuthorForm({ onAdd, onCancel, initialData }: AddAuthorFormProps) {
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Synchronise le formulaire avec les données initiales si elles existent (Pour Mode Édition)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCountry(initialData.country);
            setBirthDate(initialData.birthDate);
        } else {
            setName('');
            setCountry('');
            setBirthDate('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // On transmet les données saisies au parent sous la forme d'un CreateAuthorDto
            await onAdd({ name, country, birthDate });
        } catch (error) {
            console.error("Échec de la création de l'auteur:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 shadow-sm bg-light mb-4">
            <h4 className="card-title mb-4">
                {initialData ? `Modifier l'auteur : ${initialData.name}` : 'Ajouter un nouvel auteur'}
            </h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-semibold">Nom complet</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Albert Camus"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Pays d'origine</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: France"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Date de naissance</label>
                    <input
                        type="date"
                        className="form-control"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                    />
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                        Annuler
                    </button>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Enregistrement...' : initialData ? 'Sauvegarder' : 'Valider'}
                    </button>
                </div>
            </form>
        </div>
    );
}