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

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return String(value);
  };

  const fields = Object.entries(record.fields).filter(([key]) => key !== 'RH' && key !== 'Partenaire');
  const displayFields = fields.slice(0, 6);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer hover:border-green-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {customerType && (
          <div className={`flex items-center text-sm px-3 py-1.5 rounded w-fit ${
            customerType === 'Particulier'
              ? 'text-purple-700 bg-purple-50'
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
      <div className="space-y-3">
        {displayFields.map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 pb-2 last:border-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {key}
            </div>
            <div className="text-sm text-gray-900 font-medium truncate">
              {formatValue(value)}
            </div>
          </div>
        ))}
        {fields.length > 6 && (
          <div className="text-xs text-gray-500 italic">
            +{fields.length - 6} champs supplémentaires
          </div>
        )}
      </div>
    </div>
  );
}
