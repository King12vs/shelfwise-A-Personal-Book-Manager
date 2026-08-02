export const STATUS_META = {
  "want-to-read": {
    label: "Want to Read",
    emoji: "📘",
    spine: "bg-shelf-rust",
    badge: "bg-shelf-rust/10 text-shelf-rust-dark",
  },
  reading: {
    label: "Reading",
    emoji: "📖",
    spine: "bg-shelf-gold",
    badge: "bg-shelf-gold/15 text-shelf-gold-dark",
  },
  completed: {
    label: "Completed",
    emoji: "✅",
    spine: "bg-shelf-green",
    badge: "bg-shelf-green/10 text-shelf-green-dark",
  },
};

export const STATUS_ORDER = ["want-to-read", "reading", "completed"];

export function statusOptionLabel(status, count) {
  const meta = STATUS_META[status];
  return count === undefined ? `${meta.emoji} ${meta.label}` : `${meta.emoji} ${meta.label} (${count})`;
}
