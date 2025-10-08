import { useEffect, useState } from 'react';
import { RefreshCw, Filter, Inbox, Clock, CheckCircle, Archive, Sun, Bell, Trash2 } from 'lucide-react';
import { ContactRequest } from './lib/supabase';
import { ContactCard } from './components/ContactCard';
import { ContactModal } from './components/ContactModal';
import { StatsCard } from './components/StatsCard';

function App() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRequest[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newContactsCount, setNewContactsCount] = useState(0);
  const [formId, setFormId] = useState<string>(() => localStorage.getItem('typeform_form_id') || '');
  const [showConfig, setShowConfig] = useState<boolean>(!localStorage.getItem('typeform_form_id'));
  const [error, setError] = useState<string>('');

  const fetchContacts = async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      const typeformToken = import.meta.env.VITE_TYPEFORM_TOKEN;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-typeform?form_id=${formId}&token=${typeformToken}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
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

  useEffect(() => {
    if (formId) {
      fetchContacts();

      const interval = setInterval(() => {
        fetchContacts();
        setLastUpdate(new Date());
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [formId]);

  const handleSaveFormId = () => {
    if (formId.trim()) {
      localStorage.setItem('typeform_form_id', formId.trim());
      setShowConfig(false);
      setLoading(true);
      fetchContacts();
    }
  };

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

  const stats = {
    new: contacts.filter(c => c.status === 'new').length,
    in_progress: contacts.filter(c => c.status === 'in_progress').length,
    completed: contacts.filter(c => c.status === 'completed').length,
    total: contacts.length,
  };

  if (showConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-600 rounded-lg">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SunLib</h1>
              <p className="text-gray-600 text-sm">Configuration Typeform</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID du formulaire Typeform
              </label>
              <input
                type="text"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="Ex: MtEfRiYk"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Trouvez l'ID dans l'URL de votre formulaire : typeform.com/to/<strong>VOTRE_ID</strong>
              </p>
            </div>

            <button
              onClick={handleSaveFormId}
              disabled={!formId.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              Commencer
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
              {newContactsCount > 0 && (
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
                onClick={syncTypeform}
                disabled={syncing}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Mises à jour en temps réel activées</span>
            </div>
            <span className="text-xs text-green-600">Dernière màj: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
          </div>

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
                  <option value="Particulier">Particulier</option>
                  <option value="Professionnel">Professionnel</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Association">Association</option>
                </select>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default App;
