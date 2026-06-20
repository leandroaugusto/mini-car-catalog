import { useEffect, useRef, useState } from 'react';

import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface AutocompleteInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  minQueryLength?: number;
}

export function AutocompleteInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  fetchSuggestions,
  disabled = false,
  error,
  placeholder,
  minQueryLength = 2,
}: AutocompleteInputProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [query, setQuery] = useState(value);
  const requestId = useRef(0);
  const skipNextFetchQuery = useRef<string | null>(null);
  const isInternalValueChange = useRef(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  function clearInput() {
    isInternalValueChange.current = true;
    skipNextFetchQuery.current = null;
    setQuery('');
    setOptions([]);
    onChange('');
  }

  useEffect(() => {
    setQuery(value);
    if (
      !isInternalValueChange.current &&
      value.trim().length >= minQueryLength
    ) {
      skipNextFetchQuery.current = value;
    }
    isInternalValueChange.current = false;
  }, [minQueryLength, value]);

  useEffect(() => {
    if (disabled || debouncedQuery.trim().length < minQueryLength) {
      setOptions([]);
      return;
    }

    if (skipNextFetchQuery.current === debouncedQuery) {
      skipNextFetchQuery.current = null;
      setOptions([]);
      return;
    }

    const nextRequestId = ++requestId.current;

    void fetchSuggestions(debouncedQuery).then((items) => {
      if (nextRequestId !== requestId.current) {
        return;
      }

      setOptions(items);
    });
  }, [debouncedQuery, disabled, fetchSuggestions, minQueryLength]);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 ${
            query && !disabled ? 'pr-12' : ''
          } ${
            disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : error
                ? 'border-rose-300 ring-2 ring-rose-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
          }`}
          onChange={(event) => {
            const nextValue = event.target.value;
            isInternalValueChange.current = true;
            setQuery(nextValue);
            onChange(nextValue);
          }}
        />
        {query && !disabled ? (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            className="absolute inset-y-0 right-3 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onMouseDown={(event) => {
              event.preventDefault();
              clearInput();
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      {error ? (
        <div role="alert" className="mt-2 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
      {options.length > 0 ? (
        <ul
          aria-label={`${label} suggestions`}
          className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onMouseDown={(event) => {
                  event.preventDefault();
                  isInternalValueChange.current = true;
                  skipNextFetchQuery.current = option;
                  setQuery(option);
                  onChange(option);
                  setOptions([]);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
