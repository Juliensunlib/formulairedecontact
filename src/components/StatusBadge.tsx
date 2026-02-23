interface StatusBadgeProps {
  status: 'new' | 'to_contact' | 'qualified' | 'out_of_criteria' | 'to_relaunch';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    new: { label: 'Nouveau', className: 'bg-green-100 text-green-800 border-green-300' },
    to_contact: { label: 'A contacter', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    qualified: { label: 'Qualifié', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    out_of_criteria: { label: 'Hors Critères', className: 'bg-red-100 text-red-800 border-red-300' },
    to_relaunch: { label: 'A relancer', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
