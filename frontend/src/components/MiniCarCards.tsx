import { MiniCar } from '../types/miniCar';
import { getMiniCarPhotoUrl } from '../utils/photos';

interface MiniCarCardsProps {
  items: MiniCar[];
  onEdit: (item: MiniCar) => void;
  onDelete: (item: MiniCar) => void;
}

export function MiniCarCards({ items, onEdit, onDelete }: MiniCarCardsProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={getMiniCarPhotoUrl(item.photoUrl)}
                alt={`${item.carBrand} ${item.carModel}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                <div className="absolute inset-x-4 top-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-rose-600/90 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition hover:bg-rose-500"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <span className="absolute bottom-4 left-4 rounded-full bg-slate-950/70 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                {item.carYear}
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  {item.carBrand} {item.carModel}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {item.miniBrand}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {item.miniScale}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Car Brand
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {item.carBrand}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Mini Brand
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {item.miniBrand}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Model
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {item.carModel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Scale
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {item.miniScale}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
