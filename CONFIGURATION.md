# Configuration de l'application

## 🔑 Différence IMPORTANTE : Vercel vs Local

### Sur Vercel (Production) ☁️
- Variables dans **Vercel Dashboard → Settings → Environment Variables**
- Automatiquement injectées lors du déploiement
- Accessibles uniquement en production

### En Développement Local 💻
- Variables dans le fichier **`.env`** à la racine du projet
- Ce fichier est LOCAL et n'est PAS synchronisé avec Vercel
- Vous devez le créer et le configurer manuellement

## 📝 Comment configurer votre environnement local

### Étape 1 : Copier les variables depuis Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings → Environment Variables**
4. Copiez les valeurs suivantes :

### Étape 2 : Créer/Modifier le fichier .env

Ouvrez le fichier `.env` à la racine du projet et ajoutez :

#### Variables Typeform (obligatoires)
```env
VITE_TYPEFORM_TOKEN=votre_token_depuis_vercel
VITE_TYPEFORM_FORM_ID=MtEfRiYk
```

#### Variables Airtable (optionnelles - pour synchronisation)
```env
VITE_AIRTABLE_TOKEN=votre_token_depuis_vercel
VITE_AIRTABLE_BASE_ID=votre_base_id_depuis_vercel
VITE_AIRTABLE_TABLE_NAME=votre_table_name_depuis_vercel
```

### Étape 3 : Redémarrer l'application

1. Arrêtez le serveur (Ctrl+C)
2. Relancez avec `npm run dev`
3. Rafraîchissez votre navigateur

## 🔧 Fonctionnalités et leurs dépendances

| Fonctionnalité | Variables nécessaires | Que se passe-t-il si manquantes ? |
|----------------|----------------------|-----------------------------------|
| Afficher les réponses Typeform | `VITE_TYPEFORM_TOKEN`<br>`VITE_TYPEFORM_FORM_ID` | ❌ Erreur "token manquant" |
| Synchroniser vers Airtable | + `VITE_AIRTABLE_TOKEN`<br>+ `VITE_AIRTABLE_BASE_ID`<br>+ `VITE_AIRTABLE_TABLE_NAME` | ⚠️ Bouton orange avec alerte |
| Consulter Airtable directement | `VITE_AIRTABLE_TOKEN`<br>`VITE_AIRTABLE_BASE_ID`<br>`VITE_AIRTABLE_TABLE_NAME` | ❌ Onglet Airtable vide |

## ❓ Problèmes courants

### "VITE_TYPEFORM_TOKEN manquant"
**Cause :** Le token n'est pas dans votre `.env` local
**Solution :** Copiez-le depuis Vercel et ajoutez-le dans `.env`

### L'onglet Typeform ne charge rien
**Cause :** Variables Typeform manquantes ou invalides
**Solution :** Vérifiez que `VITE_TYPEFORM_TOKEN` et `VITE_TYPEFORM_FORM_ID` sont corrects

### Le bouton "Pousser vers Airtable" est orange
**Cause :** Variables Airtable non configurées
**Solution :** Ajoutez les 3 variables Airtable dans `.env`

### Ça marche sur Vercel mais pas en local
**Cause :** **NORMAL !** Les variables Vercel ne sont pas automatiquement copiées localement
**Solution :** Copiez manuellement les variables de Vercel vers votre `.env` local

### Après avoir ajouté les variables, rien ne change
**Cause :** Le serveur doit être redémarré
**Solution :** Arrêtez (Ctrl+C) et relancez `npm run dev`

## 🛡️ Sécurité

⚠️ **IMPORTANT :**
- Le fichier `.env` est dans `.gitignore` pour une raison
- Ne commitez JAMAIS vos tokens dans Git
- Ne partagez JAMAIS vos tokens publiquement
- Les tokens donnent accès à vos comptes Typeform et Airtable

## 📊 Vérifier votre configuration

Dans l'interface, cliquez sur le point d'interrogation (?) pour voir :
- ✓ Configuré (en vert)
- ❌ Non configuré (en rouge)

Cela vous permet de vérifier rapidement quelles variables manquent.
