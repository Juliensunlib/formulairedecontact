import { X, Calendar, FileText, User, Trash2, CheckCircle2, Database, Building2, Users, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AirtableRecord, updateAirtableRecord, mapStatusFromAirtable, mapPriorityFromAirtable, mapStatusToAirtable, mapPriorityToAirtable, fetchRHCollaborators, RHCollaborator } from '../lib/airtable';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface AirtableModalProps {
  record: AirtableRecord;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AirtableModal({ record, onClose, onUpdate }: AirtableModalProps) {
  const [status, setStatus] = useState<'new' | 'to_contact' | 'qualified' | 'out_of_criteria' | 'to_relaunch'>(
    mapStatusFromAirtable(record.fields['Statut'] as string)
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    mapPriorityFromAirtable(record.fields['Priorité'] as string)
  );
  const [notes, setNotes] = useState((record.fields['Notes internes'] as string) || '');
  const [partner, setPartner] = useState((record.fields['Partenaire'] as string) || '');
  const [customerType, setCustomerType] = useState<'Particulier' | 'Entreprise'>((record.fields['Type de client'] as string) || 'Particulier');
  const [collaborators, setCollaborators] = useState<RHCollaborator[]>([]);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>('');
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCollaborators = async () => {
      try {
        const collabs = await fetchRHCollaborators();
        setCollaborators(collabs);

        const rhField = record.fields['RH'];
        if (rhField && Array.isArray(rhField) && rhField.length > 0) {
          setSelectedCollaboratorId(rhField[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des collaborateurs:', error);
      } finally {
        setLoadingCollaborators(false);
      }
    };

    loadCollaborators();
  }, [record.fields]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return String(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateFields: Record<string, any> = {
        'Statut': mapStatusToAirtable(status),
        'Priorité': mapPriorityToAirtable(priority),
        'Notes internes': notes || '',
        'Partenaire': partner || '',
        'Type de client': customerType,
      };

      if (selectedCollaboratorId) {
        updateFields['RH'] = [selectedCollaboratorId];
      }

      await updateAirtableRecord(record.id, updateFields);

      if (onUpdate) onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating record:', error);
      alert(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir marquer ce lead comme "Hors Critères" ?')) return;

    setDeleting(true);
    try {
      await updateAirtableRecord(record.id, {
        'Statut': mapStatusToAirtable('out_of_criteria'),
      });

      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickAction = async (newStatus: string) => {
    try {
      await updateAirtableRecord(record.id, {
        'Statut': mapStatusToAirtable(newStatus),
      });

      setStatus(newStatus as any);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const mainFields = Object.entries(record.fields)
    .filter(([key]) => !['Statut', 'Priorité', 'Notes internes', 'Assigné à', 'RH'].includes(key))
    .slice(0, 8);
  const otherFields = Object.entries(record.fields)
    .filter(([key]) => !['Statut', 'Priorité', 'Notes internes', 'Assigné à', 'RH'].includes(key))
    .slice(8);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Détails du lead Airtable</h2>
            <p className="text-sm text-green-100 mt-1">
              Créé le {formatDate(record.createdTime)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Informations Airtable</h3>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={status} />
                <PriorityBadge priority={priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainFields.map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {key}
                  </div>
                  <div className="text-sm text-gray-900 font-medium break-words">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {otherFields.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Champs supplémentaires
              </h4>
              <div className="space-y-3">
                {otherFields.map(([key, value]) => (
                  <div key={key} className="border-b border-blue-100 pb-2 last:border-0">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      {key}
                    </div>
                    <div className="text-sm text-blue-900 whitespace-pre-wrap break-words">
                      {formatValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Suivi et gestion</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
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
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  {customerType === 'Particulier' ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    <Building className="w-4 h-4" />
                  )}
                  Type de client
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as 'Particulier' | 'Entreprise')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Particulier">Particulier</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Collaborateur assigné
              </label>
              {loadingCollaborators ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Chargement des collaborateurs...
                </div>
              ) : (
                <select
                  value={selectedCollaboratorId}
                  onChange={(e) => setSelectedCollaboratorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Sélectionner un collaborateur --</option>
                  {collaborators.map((collab) => (
                    <option key={collab.id} value={collab.id}>
                      {collab.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Partenaire
              </label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Nom du partenaire..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes internes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des notes sur ce lead..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => handleQuickAction('to_contact')}
                disabled={status === 'to_contact'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                A contacter
              </button>
              <button
                onClick={() => handleQuickAction('qualified')}
                disabled={status === 'qualified'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Qualifié
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Traitement...' : 'Hors Critères'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>ID Airtable:</strong> {record.id}</div>
              <div><strong>Créé le:</strong> {formatDate(record.createdTime)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
