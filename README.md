# 📚 Library Manager

Application web de gestion de bibliothèque (Livres et Auteurs) développée en **React**, **TypeScript** et **Bootstrap**. 
L'application intègre également une recherche intelligente avec l'IA (Ollama/RAG).

---

## 🚀 Installation du Projet

### Prérequis
* **Node.js** (version 20+ requise par Vite)
* **npm** ou **yarn**
---

### Démarrage du Backend
Pour démarrer le serveur Backend effectuez les deux commandes ci-dessous.
```bash
cd backend-docker
docker-compose up
```
---

### Démarrage du Frontend

Le code du frontend se situe à la racine (root) du projet. Aucun fichier de configuration `.env` n'est requis pour le frontend, il est configuré par défaut pour communiquer directement avec l'API locale sur le port `8080`.

1. Ouvrez un terminal à la racine du projet.
2. Installez les dépendances du projet :
```bash
npm install
```
Lancez le serveur de développement local (Vite) :

```bash
npm run dev
```

L'application sera alors accessible sur l'adresse locale indiquée par Vite (généralement http://localhost:5173).

---

## 📱 Présentation des Pages

L'application est structurée autour de trois espaces principaux :

### 1. 📖 Gestion des Livres (`/books`)

* **Visualisation :** Affichage de tous les livres de la bibliothèque sous forme de cartes avec le nom de leur auteur.
* **Recherche & Filtrage :** Possibilité de filtrer par titre de livre ou par auteur.
* **Création :** Formulaire dynamique d'ajout d'un livre (titre, auteur, contenu). Le bouton d'ajout est désactivé si le serveur est inaccessible.
* **Suppression :** Suppression d'un livre après confirmation de l'utilisateur.

### 2. 👤 Gestion des Auteurs (`/authors`)

* **Visualisation :** Liste complète des auteurs enregistrés dans le système.
* **Création et Édition :** Un formulaire qui s'adapte dynamiquement selon que l'on souhaite ajouter un nouvel auteur ou modifier un auteur existant.
* **Actions rapides :**
  * Un bouton qui permet d'afficher tous les livres associés à un auteur.
  * Suppression d'un auteur (possible uniquement pour les auteurs ayant 0 livre ou aucun livre).

   
### 3. 🤖 Recherche IA / RAG (`/ai-search`)

* Interface connectée à un modèle de langage local via **Ollama**.
* Permet d'obtenir des suggestions de lecture basées sur la demande de l'utilisateur.

---

## 🛠️ Difficultés rencontrées

Le développement de cette application a présenté plusieurs défis techniques intéressants, notamment en matière de gestion d'état, de résilience réseau et d'intégration d'infrastructure.

### 1. Structure et gestion de l'état (Encapsulation vs Surcharge)
Au départ, j'avais séparé la liste (AuthorsPage) et le formulaire d'ajout (AddAuthorPage) sur deux routes. Résultat : changer d'URL détruisait le composant de la liste, effaçant au passage toutes les données en mémoire. Remonter cet état dans App.tsx pour le sauvegarder aurait inutilement pollué le routeur global avec des données qui ne le concernent pas.

**La solution :**
Pour respecter le principe d'encapsulation, j'ai intégré le formulaire directement dans AuthorsPage comme sous-composant. Son affichage est simplement piloté par un état local isFormOpen.

**Le bénéfice :**
L'état des auteurs reste localisé là où il est utile. On évite les requêtes fetch répétitives à chaque navigation et l'utilisateur profite d'une interface ultra-fluide sans temps de chargement.

### 2. Résilience face aux pannes du Backend (Serveur éteint)
Lors de tests avec le serveur backend éteint, l'application React n'affichait aucun retour visuel (page blanche ou listes vides sans explications). De plus, l'utilisateur pouvait tenter de soumettre des formulaires d'ajout dans le vide, générant des erreurs non gérées dans la console.

**Solution mise en place :**

* Implémentation de blocs `try/catch` sur l'ensemble des requêtes `fetch`.
* Interception de l'erreur réseau (ex: serveur éteint) ou des réponses d'erreur HTTP (statuts non-2xx) pour alimenter un état d'erreur global `error`.
* **Sécurité "Offline" :** Les boutons d'actions critiques (Recherche, Ajout) sont automatiquement grisés (`disabled={!!error}`) si le serveur est détecté comme inaccessible, empêchant les actions impossibles.

### 3. Afficher le nom de l'auteur sur les livres
Un autre défi concernait les relations de données (entre livres et auteurs). L'API renvoie les informations des livres avec un ID numérique (`authorId`), alors que le design de l'application exige d'afficher le nom complet de l'auteur sur la carte de chaque livre.

**Solution mise en place :**
Au lieu de multiplier les requêtes HTTP, j'ai implémenté une jointure de données en local lors du rendu de la liste. À l'aide de la méthode `.find()`, l'application recherche dynamiquement l'auteur correspondant dans l'état global des auteurs :

```tsx
<div className="row g-4">
    {books.map(book => {
        const author = authors.find(a => a.id === book.authorId);
        return (
            <div className="col-md-4" key={book.id}>
                <BookCard 
                    book={book} 
                    authorName={author ? author.name : 'Chargement...'} 
                    onDelete={handleDeleteBook} 
                />
            </div>
        );
    })}
</div>
```

---

## ✨ Fonctionnalités supplémentaires

Afin d'améliorer le confort visuel et d'obtenir une application robuste, voici mes ajouts additionnels :

* **Composant réutilisable `ErrorMessage` :** Centralisation du design des alertes de déconnexion réseau sous forme de composant réutilisable pour garantir l'uniformité visuelle de l'UI sur toutes les pages.
* **Indicateur de sauvegarde (`saving` state) :** Utilisation du composant `LoadingSpinner` non seulement pour les chargements initiaux, mais également durant le processus d'envoi des formulaires (`POST`/`PUT`) pour indiquer clairement à l'utilisateur que sa création est en cours d'enregistrement.
* **Gestion des États vides :** Affichage d'un encadré lorsque la base de données est vide ou qu'aucun livre ne correspond aux filtres de recherche active.

---

## 🤖 Utilisation de l'IA

Dans le cadre de ce projet, j'ai utilisé l'assistant IA **Gemini** pour :

1.  **La création de fonctions de requêtes asynchrones :** Co-écriture de la fonction **handleAddBook** qui intègre la sécurité via le header d'authentification Bearer (JWT), la mise à jour de l'UI avec tri alphabétique automatique, et la gestion du statut de sauvegarde.
2.  **L'architecture de code :** Aide à la restructuration de la page des auteurs et à l'implémentation de la déstructuration de hooks (ex: utilisation d'un getter sans son setter sur le hook `useSearchParams`).
3.  **Le débogage TypeScript :** Résolution d'erreurs de dépréciation et de variables déclarées non lues.
4.  **L'expérience utilisateur :** Conception des mécanismes de feedback réseau (gestion du serveur éteint et désactivation dynamique des boutons).
5.  **Rédaction du readme :** Mise en page du readme pour la publication sur GitHub.