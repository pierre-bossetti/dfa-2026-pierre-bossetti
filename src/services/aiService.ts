export const aiService = {
    generateRecommendations: async (prompt: string): Promise<{ id: number; reason: string }[]> => {
        const res = await fetch('ollama/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen3:1.7b',
                prompt: prompt,
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

        // Retourne le tableau d'objets parsé
        return JSON.parse(jsonMatch[0]);
    }
};