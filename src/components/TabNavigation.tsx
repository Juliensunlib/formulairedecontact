interface TabNavigationProps {
  activeTab: 'typeform' | 'typeform2026' | 'airtable';
  onTabChange: (tab: 'typeform' | 'typeform2026' | 'airtable') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('typeform')}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'typeform'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Typeform
      </button>
      <button
        onClick={() => onTabChange('typeform2026')}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'typeform2026'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Typeform 2026
      </button>
      <button
        onClick={() => onTabChange('airtable')}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'airtable'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Airtable - Leads Solaires
      </button>
    </div>
  );
}
