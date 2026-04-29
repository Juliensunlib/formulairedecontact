import { Mail, Phone, Building2, Calendar, User, MapPin, Users, Building, Briefcase } from 'lucide-react';
import { AirtableRecord, mapStatusFromAirtable, mapPriorityFromAirtable, RHCollaborator } from '../lib/airtable';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface AirtableCardProps {
  record: AirtableRecord;
  onClick: () => void;
  rhCollaborators: RHCollaborator[];
}

export function AirtableCard({ record, onClick, rhCollaborators }: AirtableCardProps) {
  const status = mapStatusFromAirtable(record.fields['Statut'] as string);
  const priority = mapPriorityFromAirtable(record.fields['Priorité'] as string);

  const rhField = record.fields['RH'];
  const assignedTo = Array.isArray(rhField) && rhField.length > 0
    ? rhField.map(rhId => {
        const collaborator = rhCollaborators.find(c => c.id === rhId);
        return collaborator ? collaborator.name : rhId;
      }).join(', ')
    : (record.fields['Assigné à'] as string) || '';

  const firstName = (record.fields['First name'] as string) || '';
  const lastName = (record.fields['Last name'] as string) || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Sans nom';
  const email = record.fields['Email'] as string;
  const phone = record.fields['Phone number'] as string;
  const company = record.fields['Company'] as string;
  const customerType = record.fields['Type de client'] as string;
  const partner = record.fields['Partenaire'] as string;
  const motif = record.fields['Séléctionnez un motif'] as string;
  const city = record.fields['City/Town'] as string;
  const postalCode = record.fields['Zip/Post Code'] as string;
  const address = record.fields['Address'] as string;
  const submittedAt = record.fields['Submit Date (UTC)'] as string;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
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
          <h3 className="font-semibold text-lg text-gray-900">{fullName}</h3>

          {company && (
            <div className="flex items-center text-sm font-medium text-gray-700 mt-1.5">
              <Building2 className="w-4 h-4 mr-1.5 text-gray-500" />
              {company}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {assignedTo ? (
              <div className="flex items-center text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                <User className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{assignedTo}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                <User className="w-4 h-4 mr-1.5" />
                <span>Non assigné</span>
              </div>
            )}
          </div>

          {customerType && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {customerType === 'Particulier' ? (
                <Users className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Building className="w-3.5 h-3.5 mr-1" />
              )}
              {customerType}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {email && (
          <div className="flex items-center text-sm text-gray-700">
            <Mail className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center text-sm text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
            {phone}
          </div>
        )}
        {motif && (
          <div className="flex items-start text-sm text-gray-700">
            <Briefcase className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{motif}</span>
          </div>
        )}
        {(address || city) && (
          <div className="flex items-start text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {address && `${address}, `}
              {city}
              {postalCode && ` ${postalCode}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {formatDate(submittedAt)}
        </div>
        {partner && (
          <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            {partner}
          </div>
        )}
      </div>
    </div>
  );
}
