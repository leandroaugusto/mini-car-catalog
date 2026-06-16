interface ViewToggleProps {
  value: 'table' | 'cards';
  onChange: (value: 'table' | 'cards') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      aria-label="View toggle"
      className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
    >
      <button
        type="button"
        aria-pressed={value === 'table'}
        onClick={() => onChange('table')}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          value === 'table'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        Table
      </button>
      <button
        type="button"
        aria-pressed={value === 'cards'}
        onClick={() => onChange('cards')}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          value === 'cards'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        Cards
      </button>
    </div>
  );
}
