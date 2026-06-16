import { MiniCar } from '../types/miniCar';
import { getMiniCarPhotoUrl } from '../utils/photos';

interface MiniCarTableProps {
  items: MiniCar[];
  onEdit: (item: MiniCar) => void;
  onDelete: (item: MiniCar) => void;
}

export function MiniCarTable({ items, onEdit, onDelete }: MiniCarTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <caption className="sr-only">Mini car catalog</caption>
        <thead className="bg-slate-100/80 text-left">
          <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-6 py-4">Photo</th>
            <th className="px-6 py-4">Car Brand</th>
            <th className="px-6 py-4">Car Model</th>
            <th className="px-6 py-4">Year</th>
            <th className="px-6 py-4">Mini Brand</th>
            <th className="px-6 py-4">Scale</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="text-sm text-slate-600 transition hover:bg-slate-50/80">
              <td className="px-6 py-4">
                <img
                  src={getMiniCarPhotoUrl(item.photoUrl)}
                  alt={`${item.carBrand} ${item.carModel}`}
                  className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                />
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">{item.carBrand}</td>
              <td className="px-6 py-4">{item.carModel}</td>
              <td className="px-6 py-4">{item.carYear}</td>
              <td className="px-6 py-4">{item.miniBrand}</td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {item.miniScale}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
