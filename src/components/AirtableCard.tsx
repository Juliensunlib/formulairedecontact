import { AirtableRecord, mapStatusFromAirtable, mapPriorityFromAirtable } from '../lib/airtable';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface AirtableCardProps {
  record: AirtableRecord;
  onClick: () => void;
}

export function AirtableCard({ record, onClick }: AirtableCardProps) {
  const status = mapStatusFromAirtable(record.fields['Statut'] as string);
  const priority = mapPriorityFromAirtable(record.fields['Priorité'] as string);
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return String(value);
  };

  const fields = Object.entries(record.fields);
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
