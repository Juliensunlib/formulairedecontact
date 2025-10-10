import { useEffect, useState } from 'react';
import { AirtableRecord } from '../lib/airtable';
import { supabase } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface AirtableCardProps {
  record: AirtableRecord;
  onClick: () => void;
}

export function AirtableCard({ record, onClick }: AirtableCardProps) {
  const [status, setStatus] = useState<'new' | 'in_progress' | 'contacted' | 'completed' | 'archived'>('new');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadMetadata();
  }, [record.id]);

  const loadMetadata = async () => {
    try {
      const { data } = await supabase
        .from('airtable_metadata')
        .select('status, priority')
        .eq('airtable_record_id', record.id)
        .maybeSingle();

      if (data) {
        setStatus(data.status || 'new');
        setPriority(data.priority || 'medium');
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };
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
