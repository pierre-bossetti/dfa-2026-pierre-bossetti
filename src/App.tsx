import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
    // Clé pour le stockage du token
    const TOKEN_KEY = 'dfa_library_token';

    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Vérification initiale du token grâce au localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    // Fonction de connexion
    const handleLogin = async (e: React.SubmitEvent) => {
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
                throw new Error("Identifiants incorrects ou problème serveur.");
            }

            const data = await response.json();

            // Stockage local + mise à jour de l'état pour basculer l'affichage
            localStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    // 4. Fonction de déconnexion (Logout)
    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUsername('admin'); // Reset des champs
        setPassword('admin');
    };

    return (
        <div className="container mt-5">
            {/* CAS 1 : L'utilisateur n'est PAS connecté ➔ Formulaire de Login */}
            {!token ? (
                <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
                    <h2 className="card-title mb-2 text-center">Connexion</h2>
                    <p className="text-danger small text-center mb-4">
                        ⚠️ Veuillez vous connecter pour accéder à l'interface de la bibliothèque.
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label font-weight-bold">Nom d'utilisateur</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Mot de passe</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Vérification...' : 'Se connecter'}
                        </button>
                    </form>

                    {error && (
                        <div className="alert alert-danger mt-3 mb-0" role="alert">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                /* CAS 2 : L'utilisateur EST connecté ➔ Accès à l'application */
                <div className="card p-5 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="mb-0">Tableau de bord Bibliothèque</h2>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline-danger">
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}