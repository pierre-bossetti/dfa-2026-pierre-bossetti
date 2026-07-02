import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
    onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
    // État pour gérer l'ouverture du menu hamburger sur mobile
    const [isOpen, setIsOpen] = useState(false);

    // Petite fonction utilitaire pour fermer le menu automatiquement quand on clique sur un lien
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow px-3">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">📚 Library Manager</span>

                {/* Le bouton Hamburger - Visible uniquement sur mobile */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-controls="navbarNav"
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* La zone des liens - Ajout des classes dynamiques "show" selon l'état React */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <div className="navbar-nav me-auto">
                        <NavLink
                            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-warning' : ''}`}
                            to="/books"
                            onClick={closeMenu}
                        >
                            Livres
                        </NavLink>
                        <NavLink
                            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-warning' : ''}`}
                            to="/authors"
                            onClick={closeMenu}
                        >
                            Auteurs
                        </NavLink>
                        <NavLink
                            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-warning' : ''}`}
                            to="/ai-search"
                            onClick={closeMenu}
                        >
                            🤖 Suggestion IA
                        </NavLink>
                    </div>

                    {/* Bouton de déconnexion ajusté pour le responsive */}
                    <div className="d-flex mt-2 mt-lg-0">
                        <button
                            onClick={() => { closeMenu(); onLogout(); }}
                            className="btn btn-sm btn-outline-danger w-100 text-start text-lg-center"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}