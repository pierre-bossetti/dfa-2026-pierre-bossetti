import { useState, useEffect } from 'react';
import type { Book, Author } from '../types/library';
import { bookService } from '../services/bookService';
import { authorService } from '../services/authorService';
import { aiService } from '../services/aiService';

// Type exporté pour la vue
export type SuggestedBook = Book & { aiReason?: string };

export function useAiSearch() {
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [suggestedBooks, setSuggestedBooks] = useState<SuggestedBook[]>([]);

    const [loadingLibrary, setLoadingLibrary] = useState(true);
    const [loadingLlm, setLoadingLlm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Chargement initial du catalogue
    useEffect(() => {
        async function loadLibraryData() {
            setLoadingLibrary(true);
            try {
                // On réutilise nos services pour faire le Promise.all !
                const [booksData, authorsData] = await Promise.all([
                    bookService.getAll(),
                    authorService.getAll()
                ]);
                setBooks(booksData);
                setAuthors(authorsData);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Erreur lors de la préparation des données.");
            } finally {
                setLoadingLibrary(false);
            }
        }
        loadLibraryData();
    }, []);

    // 2. Fonction de recherche IA
    const searchWithAi = async (userPrompt: string) => {
        if (!userPrompt.trim()) return;

        setLoadingLlm(true);
        setError(null);
        setSuggestedBooks([]); // Reset de l'écran

        const catalogueForPrompt = books.map(b => ({
            id: b.id,
            title: b.title,
            summary: b.summary
        }));

        const aiPrompt = `
      Tu es un bibliothécaire expert et honnête. Voici le catalogue des livres disponibles en format JSON :
      ${JSON.stringify(catalogueForPrompt)}
      
      Le lecteur a fait cette demande : "${userPrompt}"
      
      Instructions strictes :
      1. Cherche dans le catalogue des livres qui correspondent VRAIMENT à la demande.
      2. Si tu trouves des correspondances pertinentes, choisis-en jusqu'à 3 maximum.
      3. CRUCIAL : Si AUCUN livre du catalogue ne correspond de près ou de loin à la demande, tu DOIS renvoyer un tableau vide : []
      4. Ne fais AUCUNE phrase d'introduction ou de conclusion.
      5. Renvoie UNIQUEMENT le tableau JSON.
      
      Exemple de réponse : [{"id": 1, "reason": "Explication..."}]
    `;

        try {
            // Appel propre au nouveau service IA
            const parsedResults = await aiService.generateRecommendations(aiPrompt);

            // Reconstruction des objets complets
            const matches = parsedResults
                .map((item): SuggestedBook | null => {
                    const matchedBook = books.find(b => b.id === item.id);
                    if (!matchedBook) return null;
                    return { ...matchedBook, aiReason: item.reason };
                })
                .filter((b): b is SuggestedBook => b !== null)
                .slice(0, 3);

            if (matches.length === 0) {
                throw new Error("L'IA n'a trouvé aucun livre correspondant à vos critères dans notre base.");
            }

            setSuggestedBooks(matches);

        } catch (error) {
            setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse.");
        } finally {
            setLoadingLlm(false);
        }
    };

    return { authors, suggestedBooks, loadingLibrary, loadingLlm, error, searchWithAi };
}