import { useState, useEffect } from 'react';
import type { Book, Author } from '../types/library';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

// On définit un type local pour enrichir l'objet Book avec l'explication de l'IA
type SuggestedBook = Book & { aiReason?: string };

export default function AiSearchPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);

    // États pour le formulaire et les résultats
    const [userPrompt, setUserPrompt] = useState('');
    const [suggestedBooks, setSuggestedBooks] = useState<SuggestedBook[]>([]);

    // États de chargement asynchrones découplés (Non-blocking UI)
    const [loadingLibrary, setLoadingLibrary] = useState(true);
    const [loadingLlm, setLoadingLlm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Chargement initial en parallèle (Livres + Auteurs)
    useEffect(() => {
        async function loadLibraryData() {
            setLoadingLibrary(true);
            const token = localStorage.getItem('dfa_library_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [booksRes, authorsRes] = await Promise.all([
                    fetch('/api/books', { headers }),
                    fetch('/api/authors', { headers })
                ]);

                if (booksRes.status === 401 || authorsRes.status === 401) {
                    localStorage.removeItem('dfa_library_token');
                    window.location.href = '/login';
                    return;
                }

                if (!booksRes.ok || !authorsRes.ok) {
                    throw new Error("Impossible de synchroniser le catalogue de la bibliothèque.");
                }

                setBooks(await booksRes.json());
                setAuthors(await authorsRes.json());
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Erreur lors de la préparation des données.");
                }
            } finally {
                setLoadingLibrary(false);
            }
        }
        loadLibraryData();
    }, []);

    // 2. Soumission du formulaire et appel Ollama
    const handleAiSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userPrompt.trim()) return;

        setLoadingLlm(true);
        setError(null);
        setSuggestedBooks([]); // On réinitialise l'écran de résultats

        // Allègement du catalogue envoyé au LLM pour économiser son contexte de mémoire
        const catalogueForPrompt = books.map(b => ({
            id: b.id,
            title: b.title,
            summary: b.summary
        }));

        // PROMPT ENGINEERING : Structure stricte pour forcer un retour JSON interprétable
        const aiPrompt = `
      Tu es un bibliothécaire expert et honnête. Voici le catalogue des livres disponibles en format JSON :
      ${JSON.stringify(catalogueForPrompt)}
      
      Le lecteur a fait cette demande : "${userPrompt}"
      
      Instructions strictes :
      1. Cherche dans le catalogue des livres qui correspondent VRAIMENT à la demande.
      2. Si tu trouves des correspondances pertinentes, choisis-en jusqu'à 3 maximum.
      3. CRUCIAL : Si AUCUN livre du catalogue ne correspond de près ou de loin à la demande (par exemple si on demande du football et qu'il n'y a aucun livre de sport), tu DOIS renvoyer un tableau vide : []
      4. Ne fais AUCUNE phrase d'introduction ou de conclusion.
      5. Renvoie UNIQUEMENT le tableau JSON.
      
      Exemple de réponse si tu trouves des livres:
      [
        {"id": 1, "reason": "Ce livre correspond à votre envie d'évasion spatiale."},
        {"id": 4, "reason": "Une intrigue sombre idéale pour le suspense."}
      ]
      
      Exemple de réponse si RIEN ne correspond:
      []
    `;

        try {
            const res = await fetch('ollama/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen3:1.7b',
                    prompt: aiPrompt,
                    stream: false
                })
            });

            if (!res.ok) throw new Error("Le serveur d'intelligence artificielle ne répond pas.");

            const data = await res.json();
            const rawResponse = data.response;

            // PARSING SÉCURISÉ : Isolation du bloc JSON via Expression Régulière
            const jsonMatch = rawResponse.match(/\[.*?\]/s);
            if (!jsonMatch) {
                throw new Error("L'IA n'a pas réussi à formater ses recommandations de manière exploitable.");
            }

            // Extraction du tableau d'objets : [{ id: number, reason: string }]
            const parsedResults: { id: number; reason: string }[] = JSON.parse(jsonMatch[0]);

            // Reconstruction des objets complets + Protection contre les hallucinations d'IDs
            const matches = parsedResults
                .map((item): SuggestedBook | null => {
                    const matchedBook = books.find(b => b.id === item.id);
                    if (!matchedBook) return null;

                    return {
                        ...matchedBook,
                        aiReason: item.reason // Injection dynamique de l'explication
                    };
                })
                .filter((b): b is SuggestedBook => b !== null) // Filtre les IDs invalides inventés par l'IA
                .slice(0, 3); // Verrouillage à 3 suggestions max

            if (matches.length === 0) {
                throw new Error("L'IA n'a trouvé aucun livre correspondant à vos critères dans notre base.");
            }

            setSuggestedBooks(matches);

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Une erreur est survenue lors de l'analyse.");
            }
        } finally {
            setLoadingLlm(false);
        }
    };

    // Affichage du chargement initial global
    if (loadingLibrary) {
        return <LoadingSpinner message="Initialisation du système et chargement des connaissances..." />;
    }

    return (
        <div className="container mt-4">
            {/* Section Formulaire */}
            <div className="row justify-content-center mb-5">
                <div className="col-md-8 text-center">
                    <h2 className="fw-bold mb-2">🤖 Recherche avec IA</h2>
                    <p className="text-muted mb-4">Décrivez ce que vous aimez et trouvez la lecture parfaite.</p>

                    <form onSubmit={handleAiSearch} className="d-flex gap-2 shadow-sm p-3 bg-light rounded border">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Ex: Un roman policier avec beaucoup de suspense..."
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            disabled={loadingLlm}
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg px-4 d-flex align-items-center"
                            disabled={loadingLlm}
                        >
                            {loadingLlm ? 'Analyse...' : 'Chercher'}
                        </button>
                    </form>

                    {error && <div className="alert alert-danger mt-3 shadow-sm">{error}</div>}
                </div>
            </div>

            {/* Spinner d'attente pendant la génération de l'IA */}
            {loadingLlm && (
                <div className="my-5">
                    <LoadingSpinner message="L'IA prépare vos recommandations (cela peut prendre quelques secondes)..." />
                </div>
            )}

            {/* Affichage des suggestions */}
            {!loadingLlm && suggestedBooks.length > 0 && (
                <div className="animate-fade-in">
                    <h4 className="fw-bold mb-4 border-bottom pb-2 text-secondary">✨ Suggestions de livres</h4>
                    <div className="row g-4">
                        {suggestedBooks.map(book => {
                            const author = authors.find(a => a.id === book.authorId);
                            return (
                                <div className="col-md-4 d-flex flex-column" key={book.id}>
                                    {/* Utilisation de ton BookCard d'origine */}
                                    <BookCard
                                        book={book}
                                        authorName={author ? author.name : 'Auteur inconnu'}
                                    />

                                    {/* Bloc justification de l'IA */}
                                    {book.aiReason && (
                                        <div className="mt-2 p-3 alert alert-info small border-info flex-grow-1 shadow-sm">
                                            <strong>Pourquoi ce livre ?</strong> <br />
                                            <span className="text-dark">{book.aiReason}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}