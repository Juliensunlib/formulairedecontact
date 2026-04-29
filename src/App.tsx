import { useEffect, useState } from 'react';
import { RefreshCw, Filter, Inbox, Clock, CheckCircle, Archive, Sun, Bell, Trash2, X, Database, Download, Search } from 'lucide-react';
import { ContactRequest, supabase } from './lib/supabase';
import { AirtableRecord, fetchAirtableRecords, fetchRHCollaborators, RHCollaborator } from './lib/airtable';
import { fetchTypeformResponsesFromSupabase, syncAllTypeformResponses } from './lib/typeform-supabase';
import { mapTypeformResponseToContact } from './utils/typeform-mapper';
import { ContactCard } from './components/ContactCard';
import { ContactModal } from './components/ContactModal';
import { AirtableCard } from './components/AirtableCard';
import { AirtableModal } from './components/AirtableModal';
import { StatsCard } from './components/StatsCard';
import { TabNavigation } from './components/TabNavigation';

function App() {
  const [activeTab, setActiveTab] = useState<'typeform' | 'airtable'>('typeform');

  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRequest[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);

  const [airtableRecords, setAirtableRecords] = useState<AirtableRecord[]>([]);
  const [filteredAirtableRecords, setFilteredAirtableRecords] = useState<AirtableRecord[]>([]);
  const [selectedAirtableRecord, setSelectedAirtableRecord] = useState<AirtableRecord | null>(null);
  const [airtableLoading, setAirtableLoading] = useState(false);
  const [airtableError, setAirtableError] = useState<string>('');
  const [airtableStatusFilter, setAirtableStatusFilter] = useState<string>('all');
  const [airtableAssignedToFilter, setAirtableAssignedToFilter] = useState<string>('all');
  const [airtablePartnerFilter, setAirtablePartnerFilter] = useState<string>('all');
  const [airtableCustomerTypeFilter, setAirtableCustomerTypeFilter] = useState<string>('all');
  const [airtableStats, setAirtableStats] = useState({
    new: 0,
    to_contact: 0,
    qualified: 0,
    out_of_criteria: 0,
    to_relaunch: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [airtableSearchQuery, setAirtableSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newContactsCount, setNewContactsCount] = useState(0);
  const formId = import.meta.env.VITE_TYPEFORM_FORM_ID || '';
  const [error, setError] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [rhCollaborators, setRhCollaborators] = useState<RHCollaborator[]>([]);

  const fetchContacts = async () => {
    try {
      setError('');
      setLoading(true);

      const responses = await fetchTypeformResponsesFromSupabase();
      const mappedContacts = responses.map(mapTypeformResponseToContact);

      setContacts(mappedContacts);
      console.log(`Chargé ${mappedContacts.length} réponses depuis Supabase`);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromTypeform = async () => {
    setSyncing(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/sync-typeform-unified`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const totalInserted = result.totals?.inserted || 0;
        const totalUpdated = result.totals?.updated || 0;
        const totalErrors = result.totals?.errors || 0;
        alert(`✅ Synchronisation terminée!\n\n✓ ${totalInserted} nouvelles réponses\n↻ ${totalUpdated} mises à jour\n${totalErrors > 0 ? `❌ ${totalErrors} erreurs` : ''}`);
        await fetchContacts();
        setLastUpdate(new Date());
      } else {
        throw new Error('La synchronisation a échoué');
      }
    } catch (error: any) {
      console.error('Error syncing:', error);
      alert(`❌ Erreur de synchronisation:\n\n${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const fetchAirtable = async () => {
    setAirtableLoading(true);
    setAirtableError('');
    try {
      const records = await fetchAirtableRecords();
      setAirtableRecords(records);
      await calculateAirtableStats(records);
    } catch (error: any) {
      console.error('Error fetching Airtable:', error);
      setAirtableError(error.message || 'Erreur de chargement Airtable');
    } finally {
      setAirtableLoading(false);
    }
  };

  const calculateAirtableStats = async (records: AirtableRecord[]) => {
    try {
      const stats = {
        new: 0,
        to_contact: 0,
        qualified: 0,
        out_of_criteria: 0,
        to_relaunch: 0,
        total: records.length,
      };

      records.forEach(record => {
        const status = (record.fields['Statut'] as string) || 'Nouveau';
        if (status === 'Nouveau') stats.new++;
        else if (status === 'A contacter') stats.to_contact++;
        else if (status === 'Qualifié') stats.qualified++;
        else if (status === 'Hors Critères') stats.out_of_criteria++;
        else if (status === 'A relancer') stats.to_relaunch++;
      });

      setAirtableStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };


  const syncAirtable = async () => {
    setSyncing(true);
    try {
      await fetchAirtable();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error syncing Airtable:', error);
      alert('Erreur lors de la synchronisation Airtable');
    } finally {
      setSyncing(false);
    }
  };


  const syncToAirtable = async () => {
    const airtableToken = import.meta.env.VITE_AIRTABLE_TOKEN;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableName = import.meta.env.VITE_AIRTABLE_TYPEFORM_TABLE_NAME;

    if (!airtableToken || !airtableBaseId || !airtableTableName) {
      alert('❌ Configuration Airtable manquante !\n\nAjoutez ces variables dans .env ou sur Vercel:\n\n• VITE_AIRTABLE_TOKEN\n• VITE_AIRTABLE_BASE_ID\n• VITE_AIRTABLE_TYPEFORM_TABLE_NAME');
      return;
    }

    if (contacts.length === 0) {
      alert('Aucune donnée Typeform à synchroniser. Chargez d\'abord les données Typeform.');
      return;
    }

    if (!confirm(`Synchroniser ${contacts.length} réponses Typeform vers Airtable?\n\nLes statuts et notes existants seront préservés.`)) {
      return;
    }

    setSyncing(true);
    try {
      console.log('🔵 Synchronisation vers Airtable...');
      console.log('Table destination:', airtableTableName);
      console.log('Nombre de contacts:', contacts.length);

      const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

      const existingRecordsResponse = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
        },
      });

      if (!existingRecordsResponse.ok) {
        const errorText = await existingRecordsResponse.text();
        throw new Error(`Erreur Airtable: ${existingRecordsResponse.status} - ${errorText}`);
      }

      const existingData = await existingRecordsResponse.json();
      const existingRecords = existingData.records || [];

      const existingMap = new Map();
      existingRecords.forEach((record: any) => {
        const responseId = record.fields['#'];
        if (responseId) {
          existingMap.set(responseId, record);
        }
      });

      const results = {
        created: 0,
        updated: 0,
        errors: 0,
      };

      for (const contact of contacts) {
        try {
          const existingRecord = existingMap.get(contact.typeform_response_id);

          console.log('📝 Traitement:', contact.name, contact.typeform_response_id);

          const nameParts = contact.name?.split(' ') || [];
          const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
          const lastName = nameParts[nameParts.length - 1] || '';

          const baseFields = {
            '#': contact.typeform_response_id,
            'Vous êtes': contact.requester_type || '',
            'Séléctionnez un motif': contact.motif || '',
            'Address': contact.address || '',
            'Address line 2': contact.address_line2 || '',
            'City/Town': contact.city || '',
            'State/Region/Province': contact.state_region || '',
            'Zip/Post Code': contact.postal_code || '',
            'Country': contact.country || '',
            'First name': firstName,
            'Last name': lastName,
            'Phone number': contact.phone || '',
            'Email': contact.email || '',
            'Company': contact.company || '',
            'Submit Date (UTC)': contact.submitted_at || new Date().toISOString(),
            'Network ID': '',
            'Statut': contact.status || 'Nouveau',
            'Priorité': contact.priority || 'Moyenne',
            'Assigné à': contact.assigned_to || '',
          };

          if (existingRecord) {
            const fieldsToUpdate: any = { ...baseFields };

            if (existingRecord.fields['Statut']) {
              fieldsToUpdate['Statut'] = existingRecord.fields['Statut'];
            }
            if (existingRecord.fields['Priorité']) {
              fieldsToUpdate['Priorité'] = existingRecord.fields['Priorité'];
            }
            if (existingRecord.fields['Notes']) {
              fieldsToUpdate['Notes'] = existingRecord.fields['Notes'];
            }
            if (existingRecord.fields['Assigné à']) {
              fieldsToUpdate['Assigné à'] = existingRecord.fields['Assigné à'];
            }

            const updateResponse = await fetch(`${airtableUrl}/${existingRecord.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${airtableToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fields: fieldsToUpdate }),
            });

            if (updateResponse.ok) {
              results.updated++;
            } else {
              results.errors++;
              const errorData = await updateResponse.json();
              console.error('❌ Erreur mise à jour:', contact.typeform_response_id);
              console.error('Détails:', errorData);
            }
          } else {
            const newFields = {
              ...baseFields,
              'Statut': 'Nouveau',
              'Priorité': 'Moyenne',
            };

            const createResponse = await fetch(airtableUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${airtableToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fields: newFields }),
            });

            if (createResponse.ok) {
              results.created++;
            } else {
              results.errors++;
              const errorData = await createResponse.json();
              console.error('❌ Erreur création:', contact.typeform_response_id);
              console.error('Détails complets:', JSON.stringify(errorData, null, 2));
              console.error('Message d\'erreur:', errorData.error?.message || errorData.message || 'Aucun message');
              console.error('Type d\'erreur:', errorData.error?.type || 'Unknown');
              console.error('Champs envoyés:', newFields);
            }
          }

          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          results.errors++;
          console.error('Erreur:', contact.typeform_response_id, error);
        }
      }

      alert(`✅ Synchronisation terminée!\n\n✓ ${results.created} nouveaux enregistrements créés\n✓ ${results.updated} enregistrements mis à jour\n${results.errors > 0 ? `❌ ${results.errors} erreurs` : ''}\n\nLes statuts et notes existants ont été préservés.`);

      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      alert(`❌ Erreur lors de la synchronisation:\n\n${error.message || error}\n\nVérifiez la console pour plus de détails.`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const loadRHCollaborators = async () => {
      try {
        const collaborators = await fetchRHCollaborators();
        setRhCollaborators(collaborators);
      } catch (error) {
        console.error('Erreur chargement collaborateurs RH:', error);
      }
    };

    loadRHCollaborators();
  }, []);

  useEffect(() => {
    if (activeTab === 'typeform') {
      fetchContacts();

      const interval = setInterval(() => {
        fetchContacts();
        setLastUpdate(new Date());
      }, 3600000);

      return () => {
        clearInterval(interval);
      };
    } else if (activeTab === 'airtable') {
      fetchAirtable();

      const interval = setInterval(() => {
        fetchAirtable();
        setLastUpdate(new Date());
      }, 3600000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [activeTab]);

  useEffect(() => {
    let filtered = [...contacts];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(c => {
        const fullName = `${c.prenom || ''} ${c.nom || ''} ${c.name || ''}`.toLowerCase();
        return fullName.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.requester_type === typeFilter);
    }

    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(c => c.assigned_to === assignedToFilter);
    }

    if (partnerFilter !== 'all') {
      filtered = filtered.filter(c => c.partner === partnerFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.submitted_at).getTime();
      const dateB = new Date(b.submitted_at).getTime();
      return dateB - dateA;
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, statusFilter, priorityFilter, typeFilter, assignedToFilter, partnerFilter]);


  useEffect(() => {
    let filtered = [...airtableRecords];

    if (airtableSearchQuery.trim()) {
      const q = airtableSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(r => {
        const firstName = (r.fields['First name'] as string || '').toLowerCase();
        const lastName = (r.fields['Last name'] as string || '').toLowerCase();
        const email = (r.fields['Email'] as string || '').toLowerCase();
        const company = (r.fields['Company'] as string || '').toLowerCase();
        return `${firstName} ${lastName}`.includes(q) || email.includes(q) || company.includes(q);
      });
    }

    if (airtableStatusFilter !== 'all') {
      filtered = filtered.filter(r => (r.fields['Statut'] as string) === airtableStatusFilter);
    }

    if (airtableAssignedToFilter !== 'all') {
      filtered = filtered.filter(r => {
        const rhField = r.fields['RH'];
        if (Array.isArray(rhField) && rhField.length > 0) {
          const collaborator = rhCollaborators.find(c => c.name === airtableAssignedToFilter);
          if (collaborator) {
            return rhField.includes(collaborator.id);
          }
        }
        return false;
      });
    }

    if (airtablePartnerFilter !== 'all') {
      filtered = filtered.filter(r => {
        const partner = r.fields['Partenaire'] as string;
        const normalizedPartner = partner?.trim() || '';
        const normalizedFilter = airtablePartnerFilter.trim();
        const matches = normalizedPartner === normalizedFilter;
        if (!matches && normalizedPartner) {
          console.log(`Partenaire non trouvé - Record: "${normalizedPartner}" vs Filter: "${normalizedFilter}"`);
        }
        return matches;
      });
    }

    if (airtableCustomerTypeFilter !== 'all') {
      filtered = filtered.filter(r => {
        const customerType = r.fields['Type de client'] as string;
        return customerType === airtableCustomerTypeFilter;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdTime).getTime();
      const dateB = new Date(b.createdTime).getTime();
      return dateB - dateA;
    });

    setFilteredAirtableRecords(filtered);
  }, [airtableRecords, airtableSearchQuery, airtableStatusFilter, airtableAssignedToFilter, airtablePartnerFilter, airtableCustomerTypeFilter, rhCollaborators]);

  const stats = {
    new: contacts.filter(c => c.status === 'new').length,
    to_contact: contacts.filter(c => c.status === 'to_contact').length,
    qualified: contacts.filter(c => c.status === 'qualified').length,
    out_of_criteria: contacts.filter(c => c.status === 'out_of_criteria').length,
    to_relaunch: contacts.filter(c => c.status === 'to_relaunch').length,
    total: contacts.length,
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600 rounded-lg">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SunLib</h1>
                <p className="text-gray-600">Gestion des demandes de contact</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'typeform' && newContactsCount > 0 && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-300">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">{newContactsCount} nouvelle{newContactsCount > 1 ? 's' : ''} demande{newContactsCount > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setNewContactsCount(0)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {activeTab === 'typeform' && (
                <>
                  <button
                    onClick={handleSyncFromTypeform}
                    disabled={syncing}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
                    title="Synchroniser toutes les réponses depuis Typeform"
                  >
                    <Download className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Synchronisation...' : 'Sync Typeform'}
                  </button>
                  <button
                    onClick={syncToAirtable}
                    disabled={syncing || contacts.length === 0}
                    className={`flex items-center gap-2 ${
                      import.meta.env.VITE_AIRTABLE_TOKEN && import.meta.env.VITE_AIRTABLE_BASE_ID
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white px-6 py-3 rounded-lg transition-colors disabled:bg-gray-400 font-medium`}
                    title={
                      !(import.meta.env.VITE_AIRTABLE_TOKEN && import.meta.env.VITE_AIRTABLE_BASE_ID)
                        ? 'Configuration Airtable manquante'
                        : 'Synchroniser vers Airtable (préserve les statuts)'
                    }
                  >
                    <Database className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Synchronisation...' : 'Pousser vers Airtable'}
                  </button>
                </>
              )}
              {activeTab === 'airtable' && (
                <button
                  onClick={syncAirtable}
                  disabled={syncing}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Synchronisation...' : 'Synchroniser'}
                </button>
              )}
            </div>
          </div>

          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Mises à jour en temps réel activées</span>
            </div>
            <span className="text-xs text-green-600">Dernière màj: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
          </div>

          {activeTab === 'typeform' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatsCard title="Nouveaux" value={stats.new} icon={Inbox} color="green" />
                <StatsCard title="A contacter" value={stats.to_contact} icon={Bell} color="blue" />
                <StatsCard title="A relancer" value={stats.to_relaunch} icon={Clock} color="yellow" />
                <StatsCard title="Qualifiés" value={stats.qualified} icon={CheckCircle} color="green" />
                <StatsCard title="Hors Critères" value={stats.out_of_criteria} icon={Trash2} color="red" />
                <StatsCard title="Total" value={stats.total} icon={Archive} color="gray" />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Filtres</h3>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou entreprise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="new">Nouveau</option>
                      <option value="to_contact">A contacter</option>
                      <option value="qualified">Qualifié</option>
                      <option value="out_of_criteria">Hors Critères</option>
                      <option value="to_relaunch">A relancer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Toutes les priorités</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de demandeur
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous les types</option>
                      <option value="Un particulier">Un particulier</option>
                      <option value="Un installateur">Un installateur</option>
                      <option value="Une entreprise">Une entreprise</option>
                      <option value="Une collectivité">Une collectivité</option>
                      <option value="Abonné SunLib">Abonné SunLib</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigné à
                    </label>
                    <select
                      value={assignedToFilter}
                      onChange={(e) => setAssignedToFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous les collaborateurs</option>
                      {rhCollaborators.map(collaborator => (
                        <option key={collaborator.id} value={collaborator.name}>{collaborator.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partenaire
                    </label>
                    <select
                      value={partnerFilter}
                      onChange={(e) => setPartnerFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous les partenaires</option>
                      {Array.from(new Set(contacts.map(c => c.partner).filter(Boolean))).sort().map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'airtable' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Filtres - Leads Solaires</h3>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou entreprise..."
                  value={airtableSearchQuery}
                  onChange={(e) => setAirtableSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
                {airtableSearchQuery && (
                  <button
                    onClick={() => setAirtableSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={airtableStatusFilter}
                    onChange={(e) => setAirtableStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="A contacter">A contacter</option>
                    <option value="Qualifié">Qualifié</option>
                    <option value="Hors Critères">Hors Critères</option>
                    <option value="A relancer">A relancer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de client
                  </label>
                  <select
                    value={airtableCustomerTypeFilter}
                    onChange={(e) => setAirtableCustomerTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="Particulier">Particulier</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigné à
                  </label>
                  <select
                    value={airtableAssignedToFilter}
                    onChange={(e) => setAirtableAssignedToFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tous les collaborateurs</option>
                    {rhCollaborators.map(collaborator => (
                      <option key={collaborator.id} value={collaborator.name}>{collaborator.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partenaire
                  </label>
                  <select
                    value={airtablePartnerFilter}
                    onChange={(e) => setAirtablePartnerFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tous les partenaires</option>
                    {Array.from(new Set(airtableRecords.map(r => {
                      const partner = r.fields['Partenaire'] as string;
                      return partner?.trim();
                    }).filter(Boolean))).sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'typeform' && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Erreur de synchronisation</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button
                      onClick={() => setShowConfig(true)}
                      className="text-sm text-red-800 underline mt-2 hover:text-red-900"
                    >
                      Modifier l'ID du formulaire
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Chargement des demandes...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune demande trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  {contacts.length === 0
                    ? 'Aucune réponse trouvée dans votre formulaire Typeform'
                    : 'Aucune demande ne correspond aux filtres sélectionnés'}
                </p>
                {contacts.length === 0 && (
                  <button
                    onClick={() => setShowConfig(true)}
                    className="text-sm text-green-600 underline hover:text-green-700"
                  >
                    Modifier l'ID du formulaire
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
              </div>
            )}

            {selectedContact && (
              <ContactModal
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
                onUpdate={fetchContacts}
              />
            )}
          </>
        )}


        {activeTab === 'airtable' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <StatsCard title="Nouveaux" value={airtableStats.new} icon={Inbox} color="green" />
              <StatsCard title="A contacter" value={airtableStats.to_contact} icon={Bell} color="blue" />
              <StatsCard title="A relancer" value={airtableStats.to_relaunch} icon={Clock} color="yellow" />
              <StatsCard title="Qualifiés" value={airtableStats.qualified} icon={CheckCircle} color="green" />
              <StatsCard title="Hors Critères" value={airtableStats.out_of_criteria} icon={Trash2} color="red" />
              <StatsCard title="Total" value={airtableStats.total} icon={Archive} color="gray" />
            </div>

            {airtableError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Erreur de synchronisation Airtable</h3>
                    <p className="text-sm text-red-700 mt-1">{airtableError}</p>
                  </div>
                </div>
              </div>
            )}

            {airtableLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Chargement des leads Airtable...</p>
              </div>
            ) : filteredAirtableRecords.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun enregistrement trouvé
                </h3>
                <p className="text-gray-600">
                  {airtableRecords.length === 0
                    ? 'Aucune donnée trouvée dans votre table Airtable'
                    : 'Aucun lead ne correspond au filtre sélectionné'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAirtableRecords.map((record) => (
                  <AirtableCard
                    key={record.id}
                    record={record}
                    rhCollaborators={rhCollaborators}
                    onClick={() => setSelectedAirtableRecord(record)}
                  />
                ))}
              </div>
            )}

            {selectedAirtableRecord && (
              <AirtableModal
                record={selectedAirtableRecord}
                onClose={() => setSelectedAirtableRecord(null)}
                onUpdate={fetchAirtable}
              />
            )}
          </>
        )}

        {showConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configuration Typeform</h2>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">IMPORTANT : Développement Local vs Vercel</h3>
                  <div className="text-sm text-purple-800 space-y-2">
                    <p><strong>Sur Vercel (Production) :</strong> Variables dans Vercel → Settings → Environment Variables</p>
                    <p><strong>En local (Développement) :</strong> Variables dans le fichier <code className="bg-purple-100 px-1 rounded">.env</code> à la racine du projet</p>
                    <p className="font-semibold text-purple-900 mt-2">Ces deux endroits sont SÉPARÉS ! Pour que ça fonctionne en local, copiez vos variables Vercel dans le fichier .env</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Configuration pour développement LOCAL</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Ouvrez le fichier <code className="bg-blue-100 px-1 rounded">.env</code> à la racine du projet</li>
                    <li>Allez sur <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Vercel</a> → Votre projet → Settings → Environment Variables</li>
                    <li>Copiez les valeurs de Vercel et collez-les dans votre .env :
                      <ul className="ml-6 mt-2 space-y-1">
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_TYPEFORM_TOKEN</code> (obligatoire)</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_TYPEFORM_FORM_ID</code> (obligatoire)</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_AIRTABLE_TOKEN</code> (pour sync Airtable)</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_AIRTABLE_BASE_ID</code> (pour sync Airtable)</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_AIRTABLE_TABLE_NAME</code> (pour affichage Airtable)</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_AIRTABLE_TYPEFORM_TABLE_NAME</code> (pour sync Typeform vers Airtable)</li>
                      </ul>
                    </li>
                    <li>Sauvegardez le fichier .env</li>
                    <li>Redémarrez le serveur de développement (arrêtez et relancez)</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Variables actuelles (Local)</h3>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <div>
                      <strong>VITE_TYPEFORM_FORM_ID:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {formId || '❌ Non configuré'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_TYPEFORM_TOKEN:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_TYPEFORM_TOKEN ? '✓ Configuré (••••••••)' : '❌ Non configuré'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_AIRTABLE_TOKEN:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_AIRTABLE_TOKEN ? '✓ Configuré (••••••••)' : '❌ Non configuré'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_AIRTABLE_BASE_ID:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_AIRTABLE_BASE_ID || '❌ Non configuré'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_AIRTABLE_TABLE_NAME:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_AIRTABLE_TABLE_NAME || '❌ Non configuré'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_AIRTABLE_TYPEFORM_TABLE_NAME:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_AIRTABLE_TYPEFORM_TABLE_NAME || '❌ Non configuré'}
                      </code>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 mb-2">Erreur actuelle</h3>
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <p className="text-sm text-red-700 mt-2">
                      Si le message indique "token manquant", ajoutez-le dans votre fichier .env local. Les variables Vercel ne sont pas accessibles en développement local.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowConfig(false)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
