interface ImageInputProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export function ImageInput({ id, label, onChange, error }: ImageInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 shadow-inner">
        <p className="mb-3 text-sm text-slate-600">
          Upload a clean photo of the mini car if you have one. PNG, JPG, or WEBP work best.
        </p>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
        onChange={(event) => {
          onChange(event.currentTarget.files?.[0] ?? null);
        }}
      />
      </div>
      {error ? (
        <div role="alert" className="mt-2 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
