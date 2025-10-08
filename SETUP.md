# Configuration de l'application SunLib

## Étape 1 : Configurer le secret Typeform dans Supabase

Votre token Typeform fonctionne correctement, mais il doit être configuré dans Supabase pour que l'edge function puisse y accéder.

### Instructions :

1. **Accédez aux secrets Supabase** :
   - Allez sur : https://supabase.com/dashboard/project/xkdgsdoglfzmxetmsuue/settings/vault

2. **Créez un nouveau secret** :
   - Cliquez sur "New secret"
   - Nom : `TYPEFORM_TOKEN`
   - Valeur : `tfp_CjnMkWykjWYVk7HNEiEcUe2cZihfjnHPo9J9KPCpYyP6_3ssnsqdSQQTa2s`
   - Cliquez sur "Create secret"

3. **L'edge function est déjà déployée** et utilisera automatiquement ce secret une fois configuré.

## Étape 2 : Configuration de l'ID du formulaire

Au premier lancement de l'application, vous serez invité à entrer l'ID de votre formulaire Typeform :

- **Votre ID de formulaire** : `MtEfRiYk`
- Vous pouvez le trouver dans l'URL : https://admin.typeform.com/form/**MtEfRiYk**/results

## Ce que l'application affiche

Une fois configurée, l'application affichera pour chaque demande :

### Informations principales :
- **Nom et prénom** du demandeur
- **Email** de contact
- **Téléphone** (si fourni)
- **Type de demandeur** : Particulier, Installateur, Entreprise, ou Collectivité
- **Type de demande** : Contact, Devis, Information
- **Adresse complète** : rue, ville, code postal, département, pays
- **Entreprise** (si applicable)
- **Date de soumission**

### Fonctionnalités de gestion :
- Changer le **statut** : Nouveau, En cours, Contacté, Terminé, Archivé
- Définir la **priorité** : Basse, Moyenne, Haute
- Ajouter des **notes internes**
- **Assigner** à un membre de l'équipe
- **Filtrer** par statut et priorité
- **Synchronisation automatique** toutes les 30 secondes

## Structure des données Typeform

Vos réponses Typeform contiennent actuellement **14 demandes** avec toutes les informations suivantes :

- Julien Bernard (particulier, demande de contact)
- MONIA ZIANI (installateur LOTUS TECHSUN)
- Marie BONAMY (entreprise, demande de devis)
- Ruslan Kovalzhy (installateur RV SERVICE)
- Ninon Samba (particulier, demande de devis)
- Laurent DURRIEU (installateur Helios Développement)
- Et 8 autres demandes...

Toutes ces informations seront automatiquement affichées dans l'interface une fois le secret configuré.

## Dépannage

Si les données ne s'affichent pas après configuration :
1. Vérifiez que le secret TYPEFORM_TOKEN est bien créé dans Supabase
2. Actualisez la page de l'application
3. Cliquez sur "Synchroniser" dans l'interface
4. Vérifiez la console du navigateur pour d'éventuelles erreurs

## Support

L'API Typeform est correctement configurée et fonctionne. Le seul élément manquant est la configuration du secret dans Supabase.
