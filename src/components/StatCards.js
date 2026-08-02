import { STATUS_META, STATUS_ORDER } from "@/lib/bookStatus";

export default function StatCards({ books }) {
  const total = books.length;
  const favorites = books.filter((b) => b.isFavorite).length;
  const counts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = books.filter((b) => b.status === status).length;
    return acc;
  }, {});

  const cards = [
    { label: "Total books", value: total },
    ...STATUS_ORDER.map((status) => ({
      label: STATUS_META[status].label,
      value: counts[status],
      spine: STATUS_META[status].spine,
    })),
    { label: "Favorites", value: favorites, spine: "bg-shelf-rust" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="card relative overflow-hidden p-4">
          {card.spine && <span className={`absolute inset-x-0 top-0 h-1 ${card.spine}`} aria-hidden="true" />}
          <p className="font-display text-2xl font-semibold">{card.value}</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ink-faint">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
