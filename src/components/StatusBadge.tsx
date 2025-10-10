interface StatusBadgeProps {
  status: 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    new: { label: 'Nouveau', className: 'bg-green-100 text-green-800 border-green-300' },
    in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    contacted: { label: 'Contacté', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    completed: { label: 'Terminé', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    archived: { label: 'Archivé', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
