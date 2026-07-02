import { useState } from 'react';

interface LoginPageProps {
    onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
            }

            const data = await response.json();

            // On transmet le token au parent (App.tsx) qui va mettre à jour l'état global
            onLogin(data.token);

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
            <div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
                <h2 className="card-title mb-2 text-center fw-bold text-primary">BiblioAdmin</h2>
                <p className="text-muted text-center small mb-4">Interface d'administration</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Nom d'utilisateur</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Mot de passe</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Vérification...
                            </>
                        ) : 'Se connecter'}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-danger mt-3 mb-0 small text-center" role="alert">
                        ❌ {error}
                    </div>
                )}
            </div>
        </div>
    );
}