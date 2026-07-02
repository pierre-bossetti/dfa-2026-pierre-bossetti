import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Import des Pages
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';
import AddBookPage from './pages/AddBookPage';
import AuthorsPage from './pages/AuthorsPage';
import AddAuthorPage from './pages/AddAuthorPage';
import AiSearchPage from './pages/AiSearchPage';

// Import des Composants globaux
import Navbar from './components/Navbar.tsx';

export default function App() {
    const TOKEN_KEY = 'dfa_library_token';
    const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

    // Fonction pour mettre à jour le token globalement lors du login/logout
    const updateToken = (newToken: string | null) => {
        if (newToken) {
            localStorage.setItem(TOKEN_KEY, newToken);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
        setToken(newToken);
    };

    return (
        <BrowserRouter>
            {/* N'affiche la barre de navigation du haut QUE si l'utilisateur est connecté */}
            {token && <Navbar onLogout={() => updateToken(null)} />}

            <div className="container mt-4">
                <Routes>
                    {/* Route Publique : Connexion */}
                    <Route
                        path="/login"
                        element={!token ? <LoginPage onLogin={(t) => updateToken(t)} /> : <Navigate to="/books" />}
                    />

                    {/* Routes Sécurisées : Redirige vers /login si le token est manquant */}
                    <Route path="/books" element={token ? <BooksPage /> : <Navigate to="/login" />} />
                    <Route path="/books/add" element={token ? <AddBookPage /> : <Navigate to="/login" />} />
                    <Route path="/authors" element={token ? <AuthorsPage /> : <Navigate to="/login" />} />
                    <Route path="/authors/add" element={token ? <AddAuthorPage /> : <Navigate to="/login" />} />
                    <Route path="/ai-search" element={token ? <AiSearchPage /> : <Navigate to="/login" />} />

                    {/* Redirection automatique par défaut */}
                    <Route path="*" element={<Navigate to={token ? "/books" : "/login"} />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}