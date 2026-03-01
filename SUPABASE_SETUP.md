# Configuration Supabase pour Famar Wellness

## Étape 1 : Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com)
2. Crée un compte gratuit
3. Clique sur "New Project"
4. Choisis un nom (ex: "famar-wellness")
5. Choisis un mot de passe pour la base de données
6. Choisis une région proche (ex: "Europe West")
7. Attends que le projet soit créé (~2 minutes)

## Étape 2 : Créer les tables

1. Dans ton projet Supabase, va dans "SQL Editor"
2. Clique sur "New Query"
3. Copie tout le contenu du fichier `supabase-schema.sql`
4. Colle-le dans l'éditeur SQL
5. Clique sur "Run" pour exécuter le script
6. Vérifie que les tables sont créées dans "Table Editor"

## Étape 3 : Créer l'utilisateur admin

1. Va dans "SQL Editor"
2. Exécute ce script pour créer le hash du mot de passe admin :

```sql
-- Génère un hash pour le mot de passe "admin"
-- Tu devras le faire depuis ton application Node.js
```

Ou utilise ce script Node.js pour générer le hash :

```javascript
const crypto = require('crypto');
const password = 'admin'; // Change ce mot de passe !
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
const passwordHash = `${salt}:${hash}`;
console.log('Password hash:', passwordHash);
```

3. Insère l'utilisateur admin :

```sql
INSERT INTO users (username, password_hash) 
VALUES ('admin', 'TON_HASH_ICI');
```

## Étape 4 : Récupérer les clés API

1. Va dans "Settings" > "API"
2. Copie ces deux valeurs :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

## Étape 5 : Configurer les variables d'environnement

### En local (.env)

Crée un fichier `.env` à la racine du projet :

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sur Netlify

1. Va dans ton projet Netlify
2. Va dans "Site settings" > "Environment variables"
3. Ajoute ces deux variables :
   - `SUPABASE_URL` = ton URL Supabase
   - `SUPABASE_ANON_KEY` = ta clé anon

## Étape 6 : Tester

1. Redémarre ton serveur local : `npm run dev`
2. Teste la réservation sur http://localhost:3000
3. Vérifie dans Supabase "Table Editor" > "bookings" que les données sont sauvegardées

## Étape 7 : Déployer

1. Commit et push tes changements
2. Netlify va automatiquement redéployer
3. Teste sur ton site en production

## Sécurité

⚠️ **Important** : Change le mot de passe admin par défaut !

1. Génère un nouveau hash avec un mot de passe fort
2. Mets à jour dans Supabase :

```sql
UPDATE users 
SET password_hash = 'NOUVEAU_HASH' 
WHERE username = 'admin';
```

## Support

- Documentation Supabase : https://supabase.com/docs
- Dashboard Supabase : https://app.supabase.com