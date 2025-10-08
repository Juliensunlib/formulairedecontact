import { X, Mail, Phone, Building2, MessageSquare, Calendar, FileText, User, Trash2, CheckCircle2, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { ContactRequest, supabase } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface ContactModalProps {
  contact: ContactRequest;
  onClose: () => void;
  onUpdate: () => void;
}

export function ContactModal({ contact, onClose, onUpdate }: ContactModalProps) {
  const [status, setStatus] = useState(contact.status);
  const [priority, setPriority] = useState(contact.priority);
  const [notes, setNotes] = useState(contact.notes || '');
  const [assignedTo, setAssignedTo] = useState(contact.assigned_to || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('typeform_metadata')
        .select('typeform_response_id')
        .eq('typeform_response_id', contact.typeform_response_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('typeform_metadata')
          .update({
            status,
            priority,
            notes: notes || null,
            assigned_to: assignedTo || null,
          })
          .eq('typeform_response_id', contact.typeform_response_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('typeform_metadata')
          .insert({
            typeform_response_id: contact.typeform_response_id,
            status,
            priority,
            notes: notes || null,
            assigned_to: assignedTo || null,
          });

        if (error) throw error;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette demande ?')) return;

    setDeleting(true);
    try {
      const { data: existing } = await supabase
        .from('typeform_metadata')
        .select('typeform_response_id')
        .eq('typeform_response_id', contact.typeform_response_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('typeform_metadata')
          .update({ status: 'archived' })
          .eq('typeform_response_id', contact.typeform_response_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('typeform_metadata')
          .insert({
            typeform_response_id: contact.typeform_response_id,
            status: 'archived',
            priority: 'medium',
          });

        if (error) throw error;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error archiving contact:', error);
      alert('Erreur lors de l\'archivage');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickAction = async (newStatus: string) => {
    try {
      const { data: existing } = await supabase
        .from('typeform_metadata')
        .select('typeform_response_id')
        .eq('typeform_response_id', contact.typeform_response_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('typeform_metadata')
          .update({ status: newStatus })
          .eq('typeform_response_id', contact.typeform_response_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('typeform_metadata')
          .insert({
            typeform_response_id: contact.typeform_response_id,
            status: newStatus,
            priority: 'medium',
          });

        if (error) throw error;
      }

      setStatus(newStatus as any);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold">Détails de la demande</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{contact.name || 'Sans nom'}</h3>
                {(contact as any).requester_type && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <Users className="w-4 h-4 mr-2" />
                    {(contact as any).requester_type}
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    {contact.company}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <StatusBadge status={contact.status} />
                <PriorityBadge priority={contact.priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              {contact.email && (
                <div className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                  <a href={`mailto:${contact.email}`} className="hover:text-green-600">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-green-600" />
                  <a href={`tel:${contact.phone}`} className="hover:text-green-600">
                    {contact.phone}
                  </a>
                </div>
              )}
              {((contact as any).address || (contact as any).city) && (
                <div className="flex items-start text-gray-700 col-span-full">
                  <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {(contact as any).address && `${(contact as any).address}, `}
                    {(contact as any).city}
                    {(contact as any).postal_code && ` ${(contact as any).postal_code}`}
                    {(contact as any).department && `, ${(contact as any).department}`}
                    {(contact as any).country && ` (${(contact as any).country})`}
                  </span>
                </div>
              )}
              <div className="flex items-center text-gray-600 text-sm col-span-full">
                <Calendar className="w-4 h-4 mr-2" />
                Soumis le {formatDate(contact.submitted_at)}
              </div>
            </div>
          </div>

          {contact.message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigné à
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Nom de la personne"
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
              placeholder="Ajoutez des notes sur cette demande..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => handleQuickAction('in_progress')}
                disabled={status === 'in_progress'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marquer en cours
              </button>
              <button
                onClick={() => handleQuickAction('completed')}
                disabled={status === 'completed'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marquer terminé
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
                {deleting ? 'Archivage...' : 'Archiver'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
