import { AirtableRecord, mapStatusFromAirtable, mapPriorityFromAirtable, RHCollaborator } from '../lib/airtable';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { User, Building2, Users, Building } from 'lucide-react';

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
    : '';

  const partner = record.fields['Partenaire'] as string;
  const customerType = record.fields['Type de client'] as string;

  const firstName = record.fields['First name'] as string || '';
  const lastName = record.fields['Last name'] as string || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || '-';
  const email = record.fields['Email'] as string || '';
  const phone = record.fields['Phone number'] as string || '';
  const city = record.fields['City/Town'] as string || '';
  const motif = record.fields['Séléctionnez un motif'] as string || '';
  const submittedAt = record.fields['Submit Date (UTC)'] as string;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer hover:border-green-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
          {customerType && (
            <div className={`flex items-center text-sm px-3 py-1.5 rounded w-fit ${
              customerType === 'Particulier'
                ? 'text-teal-700 bg-teal-50'
                : 'text-orange-700 bg-orange-50'
            }`}>
              {customerType === 'Particulier' ? (
                <Users className="w-4 h-4 mr-1.5" />
              ) : (
                <Building className="w-4 h-4 mr-1.5" />
              )}
              <span className="font-medium">{customerType}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-base font-semibold text-gray-900 truncate">{fullName}</span>
        </div>
        {email && <p className="text-sm text-gray-500 truncate pl-6">{email}</p>}
      </div>

      <div className="space-y-1.5 mb-3">
        {phone && (
          <div className="text-sm text-gray-600 truncate">
            <span className="font-medium text-gray-500">Tel :</span> {phone}
          </div>
        )}
        {city && (
          <div className="text-sm text-gray-600 truncate">
            <span className="font-medium text-gray-500">Ville :</span> {city}
          </div>
        )}
        {motif && (
          <div className="text-sm text-gray-600 truncate">
            <span className="font-medium text-gray-500">Motif :</span> {motif}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {assignedTo && (
          <div className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded w-fit">
            <User className="w-4 h-4 mr-1.5" />
            <span className="font-medium">{assignedTo}</span>
          </div>
        )}
        {partner && (
          <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded w-fit">
            <Building2 className="w-4 h-4 mr-1.5" />
            <span className="font-medium">{partner}</span>
          </div>
        )}
      </div>

      {submittedAt && (
        <div className="text-xs text-gray-400 mt-2">
          {new Date(submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  );
}
