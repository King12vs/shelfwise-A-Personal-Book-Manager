"use client";

export default function StarRating({ value, onChange, readOnly = false, size = "text-base" }) {
  const stars = [1, 2, 3, 4, 5];

  if (readOnly) {
    if (!value) return null;
    return (
      <div className={`flex items-center gap-0.5 ${size}`} aria-label={`Rated ${value} out of 5`}>
        {stars.map((n) => (
          <span key={n} className={n <= value ? "text-shelf-gold-dark" : "text-ink/15"}>
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(value === n ? null : n)}
          className={`text-xl leading-none transition-colors ${
            value && n <= value ? "text-shelf-gold-dark" : "text-ink/20 hover:text-shelf-gold"
          }`}
        >
          ★
        </button>
      ))}
      {value ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-ink-faint hover:text-ink-soft"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
