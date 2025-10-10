import { X } from 'lucide-react';
import { AirtableRecord } from '../lib/airtable';

interface AirtableModalProps {
  record: AirtableRecord;
  onClose: () => void;
}

export function AirtableModal({ record, onClose }: AirtableModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Détails du lead</h2>
            <p className="text-sm text-gray-500 mt-1">
              Créé le {formatDate(record.createdTime)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(record.fields).map(([key, value]) => (
              <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  {key}
                </div>
                <div className="text-base text-gray-900 whitespace-pre-wrap break-words">
                  {formatValue(value)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <strong>ID Airtable:</strong> {record.id}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
