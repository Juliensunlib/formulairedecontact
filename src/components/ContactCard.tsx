import { Mail, Phone, Building2, MessageSquare, Calendar, User, MapPin, Users, Link2, Briefcase, MapPinned } from 'lucide-react';
import { ContactRequest } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface ContactCardProps {
  contact: ContactRequest;
  onClick: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{contact.name || 'Sans nom'}</h3>

          {contact.company && (
            <div className="flex items-center text-sm font-medium text-gray-700 mt-1.5">
              <Building2 className="w-4 h-4 mr-1.5 text-gray-500" />
              {contact.company}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {contact.assigned_to ? (
              <div className="flex items-center text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                <User className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{contact.assigned_to}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                <User className="w-4 h-4 mr-1.5" />
                <span>Non assigné</span>
              </div>
            )}
          </div>

          {(contact as any).requester_type && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Users className="w-3.5 h-3.5 mr-1" />
              {(contact as any).requester_type}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={contact.status} />
          <PriorityBadge priority={contact.priority} />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {contact.email && (
          <div className="flex items-center text-sm text-gray-700">
            <Mail className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
            {contact.phone}
          </div>
        )}
        {contact.motif && (
          <div className="flex items-start text-sm text-gray-700">
            <Briefcase className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{contact.motif}</span>
          </div>
        )}
        {((contact as any).address || (contact as any).city) && (
          <div className="flex items-start text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {(contact as any).address && `${(contact as any).address}, `}
              {(contact as any).city}
              {(contact as any).postal_code && ` ${(contact as any).postal_code}`}
              {(contact as any).department && `, ${(contact as any).department}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {formatDate(contact.submitted_at)}
        </div>
        <div className="flex items-center gap-2">
          {(contact as any).network_id && (
            <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200" title="Lié à Airtable">
              <Link2 className="w-3.5 h-3.5 mr-1" />
              {(contact as any).network_id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
