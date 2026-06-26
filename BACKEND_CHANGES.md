# Changements Backend Requis pour le Frontend Tests

## 1. Table `tests` — ajout colonne `resolved`

### Migration SQL (à adapter selon votre ORM/dialecte)

```sql
ALTER TABLE tests ADD COLUMN resolved BOOLEAN DEFAULT FALSE NOT NULL;
```

Si vous utilisez un ORM :
- Entité `Test` / `TestStep` : ajouter le champ `resolved: boolean` (ou `boolean?` selon vos conventions)
- Générer et appliquer la migration correspondante

## 2. Endpoint `GET /tests` et `GET /tests/{id}`

- La réponse JSON **doit inclure** le champ `resolved` (ex: `"resolved": true` ou `false`)
- Si la colonne n'existe pas encore, retourner `"resolved": false` par défaut pour ne pas casser le frontend

**Exemple de réponse attendue :**

```json
{
  "id": 42,
  "sessionId": 7,
  "fonction": "Connexion utilisateur",
  "precondition": "Compte actif",
  "etapes": "Aller sur /login...",
  "resultatAttendu": "Accès au dashboard",
  "resultatObtenu": "",
  "statut": "EN COURS",
  "commentaires": "",
  "resolved": true
}
```

## 3. Endpoint `PUT /tests/{id}`

- Accepter le champ optionnel `resolved` dans le body
- Mettre à jour uniquement ce champ si fourni
- Ne pas écraser les autres champs non présents dans la requête (mise à jour partielle)
- Retourner l'objet test complet mis à jour (avec `resolved`)

**Exemple de body reçu :**

```json
{
  "resolved": true
}
```

**Exemple de réponse attendue :**

```json
{
  "id": 42,
  "sessionId": 7,
  "fonction": "Connexion utilisateur",
  "resolved": true,
  ...
}
```

## 4. Règles importantes

- `resolved` est **indépendant** du champ `statut`. Un test peut être `EN COURS` ET `resolved: true` (le frontend l'affiche barré).
- Aucune validation métier particulière n'est requise sur `resolved`, c'est un flag libre.
- Si la colonne `resolved` n'existe pas temporairement, le frontend utilisera `localStorage` en fallback. Mais pour un fonctionnement propre et multi-utilisateurs, implémenter la colonne est recommandé.

## 5. Endpoints concernés

| Endpoint | Méthode | Changement |
|-----------|---------|------------|
| `/tests` | GET | Ajouter `resolved` dans la réponse |
| `/tests/{id}` | GET | Ajouter `resolved` dans la réponse |
| `/tests/{id}` | PUT | Accepter et persister `resolved` |

## 6. Test rapide après implémentation

1. `GET /tests` → vérifier que chaque test retourne `"resolved": false`
2. `PUT /tests/42` avec body `{ "resolved": true }` → vérifier que `GET /tests/42` retourne `"resolved": true`
3. `PUT /tests/42` avec body `{ "resolved": false }` → vérifier que `GET /tests/42` retourne `"resolved": false`
4. Appeler `PUT /tests/42` avec d'autres champs (ex: `{ "statut": "OK" }`) → vérifier que `resolved` n'est pas écrasé ou modifié involontairement

## 7. Endpoint `GET /dashboard/stats` — ajout compteurs résolusefef

La réponse JSON doit inclure 3 nouveaux champs :

- `testsResolved`: nombre total de tests avec `resolved = true`
- `testsUnresolved`: nombre total de tests avec `resolved = false`
- `testsRateResolved`: pourcentage de tests résolus (`(resolved / total) * 100`)

**Exemple de réponse attendue :**

```json
{
  "applications": 12,
  "sessions": 45,
  "tests": 230,
  "users": 18,
  "accounts": 56,
  "testsOk": 120,
  "testsBug": 35,
  "testsEnCours": 75,
  "testsRateOk": 52,
  "testsRateBug": 15,
  "testsRatePending": 33,
  "testsResolved": 110,
  "testsUnresolved": 120,
  "testsRateResolved": 48,
  "activeAccounts": 50,
  "recentSessions": 8,
  "bugReports": 14
}
```

**Règles de calcul :**

- `testsResolved + testsUnresolved` doit être égal à `tests` (nombre total)
- `testsRateResolved` doit être un entier (pourcentage arrondi)
- Les compteurs `testsOk`, `testsBug`, `testsEnCours` sont basés sur le champ `statut` et restent indépendants de `resolved`
- `testsResolved` est basé uniquement sur le champ `resolved = true`

**SQL exemple pour calculer ces valeurs :**

```sql
SELECT
  COUNT(*) as tests,
  SUM(CASE WHEN statut = 'OK' THEN 1 ELSE 0 END) as testsOk,
  SUM(CASE WHEN statut = 'BUG' THEN 1 ELSE 0 END) as testsBug,
  SUM(CASE WHEN statut = 'EN COURS' OR statut = 'PENDING' THEN 1 ELSE 0 END) as testsEnCours,
  SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as testsResolved,
  SUM(CASE WHEN resolved = false OR resolved IS NULL THEN 1 ELSE 0 END) as testsUnresolved,
  ROUND(100.0 * SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) / COUNT(*)) as testsRateResolved,
  ROUND(100.0 * SUM(CASE WHEN statut = 'OK' THEN 1 ELSE 0 END) / COUNT(*)) as testsRateOk,
  ROUND(100.0 * SUM(CASE WHEN statut = 'BUG' THEN 1 ELSE 0 END) / COUNT(*)) as testsRateBug
FROM tests;
```

Ajuster les conditions `statut` selon les valeurs réelles utilisées dans votre application (`EN COURS`, `PENDING`, `OK`, `BUG`, etc.).

**Fichier frontend concerné :** `src/api/dashboardApi.ts` — ajouter les 3 champs dans `DashboardStats`

## 8. Endpoint `GET /sessions` — ajout statistiques de tests par session

La réponse JSON de la liste des sessions doit inclure le tableau `tests` pour chaque session, **ou** fournir les compteurs directement pour que le frontend puisse afficher les statistiques sur les cartes de session.

### Option A (recommandée) : inclure `tests` dans chaque session

```json
{
  "id": 7,
  "nom": "Session Q2",
  "description": "...",
  "statut": "OPEN",
  "environnement": "PRODUCTION",
  "plateforme": "Web",
  "dateCreation": "2025-01-15T10:00:00Z",
  "createdByUsername": "admin",
  "tests": [
    {
      "id": 42,
      "fonction": "Connexion",
      "statut": "OK",
      "resolved": true
    },
    {
      "id": 43,
      "fonction": "Paiement",
      "statut": "BUG",
      "resolved": false
    }
  ]
}
```

### Option B (légère) : ajouter des compteurs directement

```json
{
  "id": 7,
  "nom": "Session Q2",
  "plateforme": "Mobile",
  "testsCount": 12,
  "testsResolvedCount": 8,
  "testsOkCount": 5,
  "testsBugCount": 3,
  "testsEnCoursCount": 4
}
```

### Toujours inclus dans la réponse (option A ou B)

| Champ | Type | Description |
|-------|------|-------------|
| `tests` | array | Liste des tests de la session (chaque test avec `id`, `fonction`, `statut`, `resolved`) |
| `testsCount` | number | Nombre total de tests |
| `testsResolvedCount` | number | Tests avec `resolved = true` |
| `testsOkCount` | number | Tests avec `statut = 'OK'` |
| `testsBugCount` | number | Tests avec `statut = 'BUG'` |
| `testsEnCoursCount` | number | Tests avec `statut = 'EN COURS'` ou `'PENDING'` |
| `plateforme` | string | Plateforme cible : `'Web'` ou `'Mobile'` |

**Fichier frontend concerné :** `src/pages/Tests/index.tsx` — les cartes de session affichent maintenant : Total, Résolus, OK, BUG, En cours. Le champ `plateforme` est ajouté dans les formulaires de création (`src/pages/Tests/create/index.tsx`) et modification (`src/pages/Tests/[id]/edit/index.tsx`) de session, ainsi que dans le formulaire inline de `src/pages/Tests/index.tsx`.

## 9. Table `test_sessions` — ajout colonne `plateforme`

### Migration SQL

```sql
ALTER TABLE test_sessions ADD COLUMN plateforme VARCHAR(10) DEFAULT 'Web' NOT NULL;
```

- Valeurs autorisées : `'Web'` ou `'Mobile'`
- Valeur par défaut : `'Web'`

### Entité `TestSession`

- Ajouter le champ `plateforme: string` (ou `plateforme?: string` selon vos conventions)
- Le champ est envoyé par le frontend dans les formulaires de création et modification de session

## 10. Endpoints sessions concernés par `plateforme`

| Endpoint | Méthode | Changement |
|-----------|---------|------------|
| `/test-sessions` | POST | Accepter et persister `plateforme` |
| `/test-sessions/{id}` | PUT | Accepter et persister `plateforme` |
| `/test-sessions` | GET | Retourner `plateforme` dans chaque session |
| `/test-sessions/{id}` | GET | Retourner `plateforme` dans la session |
| `/test-sessions/{id}/export` | GET | Retourner `plateforme` dans la session exportée |
