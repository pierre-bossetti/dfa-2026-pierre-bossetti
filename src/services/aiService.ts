export const aiService = {
    generateRecommendations: async (prompt: string): Promise<{ id: number; reason: string }[]> => {

        // 1. Définition stricte du format attendu (JSON Schema)
        const jsonSchema = {
            type: "object",
            properties: {
                books: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            reason: { type: "string" }
                        },
                        required: ["id", "reason"]
                    }
                }
            },
            required: ["books"]
        };

        // 2. Appel à l'API avec le paramètre "format"
        const res = await fetch('ollama/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen3:1.7b',
                messages: [{ role: 'user', content: prompt }],
                stream: false,
                format: jsonSchema, // 🔒 On verrouille la structure ici !
                options: { temperature: 0 } // 🎯 Empêche l'IA de divaguer
            })
        });

        if (!res.ok) throw new Error("Le serveur d'intelligence artificielle ne répond pas.");

        const data = await res.json();

        // 3. Plus besoin d'expression régulière (Regex) ! On parse directement.
        const parsedResponse = JSON.parse(data.message.content);

        // On retourne le tableau contenu dans la propriété "books"
        return parsedResponse.books;
    }
};