interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { label: 'Basse', className: 'bg-gray-100 text-gray-700' },
    medium: { label: 'Moyenne', className: 'bg-green-100 text-green-700' },
    high: { label: 'Haute', className: 'bg-red-100 text-red-700' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
