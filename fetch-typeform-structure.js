// Script pour récupérer la structure du formulaire Typeform
// Usage: node fetch-typeform-structure.js VOTRE_TOKEN_TYPEFORM

const FORM_ID = 'MtEfRiYk';
const token = process.argv[2];

if (!token) {
  console.error('❌ Usage: node fetch-typeform-structure.js VOTRE_TOKEN_TYPEFORM');
  process.exit(1);
}

async function fetchTypeformStructure() {
  try {
    console.log('🔍 Récupération de la structure du formulaire Typeform...\n');

    // Récupérer la définition du formulaire
    const formResponse = await fetch(`https://api.typeform.com/forms/${FORM_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!formResponse.ok) {
      throw new Error(`Erreur API Typeform: ${formResponse.status} ${formResponse.statusText}`);
    }

    const formData = await formResponse.json();

    console.log('📋 INFORMATIONS DU FORMULAIRE');
    console.log('================================');
    console.log(`Titre: ${formData.title}`);
    console.log(`ID: ${formData.id}`);
    console.log(`Nombre de champs: ${formData.fields?.length || 0}\n`);

    console.log('📝 STRUCTURE DES CHAMPS');
    console.log('================================\n');

    if (formData.fields && formData.fields.length > 0) {
      formData.fields.forEach((field, index) => {
        console.log(`Champ ${index + 1}:`);
        console.log(`  ID: ${field.id}`);
        console.log(`  Ref: ${field.ref || 'N/A'}`);
        console.log(`  Type: ${field.type}`);
        console.log(`  Title: ${field.title}`);
        console.log(`  Required: ${field.validations?.required || false}`);

        // Afficher les choix pour les champs à choix multiples
        if (field.properties?.choices) {
          console.log(`  Choix disponibles:`);
          field.properties.choices.forEach(choice => {
            console.log(`    - ${choice.label} (id: ${choice.id})`);
          });
        }

        // Afficher les propriétés du champ
        if (field.properties) {
          const props = { ...field.properties };
          delete props.choices; // Déjà affiché
          if (Object.keys(props).length > 0) {
            console.log(`  Propriétés:`, JSON.stringify(props, null, 4));
          }
        }

        console.log('');
      });
    }

    // Récupérer quelques réponses pour voir la structure des données
    console.log('\n📊 EXEMPLE DE RÉPONSES (3 dernières)');
    console.log('================================\n');

    const responsesResponse = await fetch(
      `https://api.typeform.com/forms/${FORM_ID}/responses?page_size=3`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (responsesResponse.ok) {
      const responsesData = await responsesResponse.json();

      if (responsesData.items && responsesData.items.length > 0) {
        responsesData.items.forEach((response, index) => {
          console.log(`\nRéponse ${index + 1} (${response.submitted_at}):`);
          console.log(`  Response ID: ${response.response_id}`);
          console.log(`  Landed at: ${response.landed_at}`);
          console.log(`  Submitted at: ${response.submitted_at}`);

          if (response.answers) {
            console.log(`  Réponses:`);
            response.answers.forEach(answer => {
              const field = formData.fields.find(f => f.id === answer.field.id);
              console.log(`    - ${field?.title || answer.field.id}:`);
              console.log(`      Type: ${answer.type}`);
              console.log(`      Valeur:`, JSON.stringify(answer[answer.type], null, 6));
            });
          }

          if (response.hidden) {
            console.log(`  Hidden fields:`, response.hidden);
          }
        });
      } else {
        console.log('Aucune réponse trouvée.');
      }
    }

    // Sauvegarder dans un fichier JSON
    const output = {
      form: {
        id: formData.id,
        title: formData.title,
        fields: formData.fields
      },
      sample_responses: responsesData?.items || []
    };

    const fs = require('fs');
    fs.writeFileSync('typeform-structure.json', JSON.stringify(output, null, 2));
    console.log('\n✅ Structure sauvegardée dans typeform-structure.json');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fetchTypeformStructure();
