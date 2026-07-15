export interface Author {
    id: number;
    name: string;
    birthDate: string; // Format "YYYY-MM-DD" reçu du serveur
    country: string;
    bookIds: number[]; // Liste des IDs des livres associés
}

export interface Book {
    id: number;
    title: string;
    authorId: number; // Reçu du serveur à la place de l'objet complet
    year: number;
    content: string;
    summary: string;
}

// Interfaces pour les formulaires de création
export interface CreateBookDto {
    title: string;
    authorId: number;
    year: number;
    content: string;
}

export interface CreateAuthorDto {
    name: string;
    country: string;
    birthDate: string; // Doit être envoyé au format "YYYY-MM-DD"
}