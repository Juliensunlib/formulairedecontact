import { useEffect, useState } from 'react';
import { RefreshCw, Filter, Inbox, Clock, CheckCircle, Archive, Sun, Bell, Trash2, X } from 'lucide-react';
import { ContactRequest } from './lib/supabase';
import { AirtableRecord, fetchAirtableRecords } from './lib/airtable';
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
  const [airtableStats, setAirtableStats] = useState({
    new: 0,
    in_progress: 0,
    contacted: 0,
    completed: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newContactsCount, setNewContactsCount] = useState(0);
  const formId = import.meta.env.VITE_TYPEFORM_FORM_ID || '';
  const [error, setError] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  const fetchContacts = async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      const typeformToken = import.meta.env.VITE_TYPEFORM_TOKEN;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-typeform?form_id=${formId}`;
      console.log('Fetching:', url);
      console.log('Token present:', !!typeformToken);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Typeform-Token': typeformToken,
          'X-Airtable-Token': import.meta.env.VITE_AIRTABLE_TOKEN || '',
          'X-Airtable-Base-Id': import.meta.env.VITE_AIRTABLE_BASE_ID || '',
          'X-Airtable-Table-Name': import.meta.env.VITE_AIRTABLE_TABLE_NAME || '',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch'}`);
        }
      }

      const result = await response.json();
      setContacts(result.data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
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
        in_progress: 0,
        contacted: 0,
        completed: 0,
        total: records.length,
      };

      records.forEach(record => {
        const status = (record.fields['Statut'] as string) || 'Nouveau';
        if (status === 'Nouveau') stats.new++;
        else if (status === 'En cours') stats.in_progress++;
        else if (status === 'Contacté') stats.contacted++;
        else if (status === 'Terminé') stats.completed++;
      });

      setAirtableStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const syncTypeform = async () => {
    setSyncing(true);
    try {
      await fetchContacts();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
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

  useEffect(() => {
    if (activeTab === 'typeform' && formId) {
      fetchContacts();

      const interval = setInterval(() => {
        fetchContacts();
        setLastUpdate(new Date());
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    } else if (activeTab === 'airtable') {
      fetchAirtable();

      const interval = setInterval(() => {
        fetchAirtable();
        setLastUpdate(new Date());
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [activeTab, formId]);

  useEffect(() => {
    let filtered = [...contacts];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.requester_type === typeFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    let filtered = [...airtableRecords];

    if (airtableStatusFilter !== 'all') {
      filtered = filtered.filter(r => (r.fields['Statut'] as string) === airtableStatusFilter);
    }

    setFilteredAirtableRecords(filtered);
  }, [airtableRecords, airtableStatusFilter]);

  const stats = {
    new: contacts.filter(c => c.status === 'new').length,
    in_progress: contacts.filter(c => c.status === 'in_progress').length,
    completed: contacts.filter(c => c.status === 'completed').length,
    total: contacts.length,
  };

  if (!formId && activeTab === 'typeform') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-600 rounded-lg">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SunLib</h1>
              <p className="text-gray-600 text-sm">Configuration requise</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                L'ID du formulaire Typeform n'est pas configuré. Veuillez l'ajouter dans le fichier <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> :
              </p>
              <pre className="mt-2 bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
VITE_TYPEFORM_FORM_ID=VOTRE_ID_ICI
              </pre>
            </div>
            <button
              onClick={() => setActiveTab('airtable')}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Voir les données Airtable
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={activeTab === 'typeform' ? syncTypeform : syncAirtable}
                disabled={syncing}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard title="Nouveaux" value={stats.new} icon={Inbox} color="green" />
                <StatsCard title="En cours" value={stats.in_progress} icon={Clock} color="blue" />
                <StatsCard title="Terminés" value={stats.completed} icon={CheckCircle} color="gray" />
                <StatsCard title="Total" value={stats.total} icon={Archive} color="yellow" />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Filtres</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option value="in_progress">En cours</option>
                      <option value="contacted">Contacté</option>
                      <option value="completed">Terminé</option>
                      <option value="archived">Archivé</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={airtableStatusFilter}
                  onChange={(e) => setAirtableStatusFilter(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Nouveau">Nouveau</option>
                  <option value="En cours">En cours</option>
                  <option value="Contacté">Contacté</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Archivé">Archivé</option>
                </select>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatsCard title="Nouveaux" value={airtableStats.new} icon={Inbox} color="green" />
              <StatsCard title="En cours" value={airtableStats.in_progress} icon={Clock} color="blue" />
              <StatsCard title="Terminés" value={airtableStats.completed} icon={CheckCircle} color="gray" />
              <StatsCard title="Total" value={airtableStats.total} icon={Archive} color="yellow" />
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Comment configurer ?</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Créez un token Typeform avec les permissions "Read responses" sur <a href="https://admin.typeform.com/account#/section/tokens" target="_blank" rel="noopener noreferrer" className="underline">cette page</a></li>
                    <li>Trouvez l'ID de votre formulaire dans son URL (ex: https://admin.typeform.com/form/<strong>AbC123</strong>/)</li>
                    <li>Dans Vercel, allez dans <strong>Settings → Environment Variables</strong></li>
                    <li>Ajoutez ces variables :
                      <ul className="ml-6 mt-2 space-y-1">
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_TYPEFORM_TOKEN</code> : votre token</li>
                        <li><code className="bg-blue-100 px-2 py-0.5 rounded">VITE_TYPEFORM_FORM_ID</code> : l'ID du formulaire</li>
                      </ul>
                    </li>
                    <li>Redéployez votre application</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Variables actuelles</h3>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <div>
                      <strong>VITE_TYPEFORM_FORM_ID:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {formId || '(non configuré)'}
                      </code>
                    </div>
                    <div>
                      <strong>VITE_TYPEFORM_TOKEN:</strong>{' '}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">
                        {import.meta.env.VITE_TYPEFORM_TOKEN ? '••••••••' : '(non configuré)'}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">Erreur actuelle</h3>
                  <p className="text-sm text-red-800">{error || 'Typeform API error: Forbidden'}</p>
                  <p className="text-sm text-red-700 mt-2">
                    Cette erreur signifie que le token est invalide, expiré, ou n'a pas les permissions nécessaires pour accéder à ce formulaire.
                  </p>
                </div>
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
