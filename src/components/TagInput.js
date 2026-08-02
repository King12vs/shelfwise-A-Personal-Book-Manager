"use client";

import { useState } from "react";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export default function TagInput({ id, tags, onChange, error }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    setDraft("");
    if (!value) return;
    if (tags.includes(value)) return;
    if (tags.length >= MAX_TAGS) return;
    onChange([...tags, value]);
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div>
      <div
        className="field-input flex min-h-[2.75rem] flex-wrap items-center gap-1.5 py-1.5"
        onClick={() => document.getElementById(id)?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-shelf-green/10 px-2.5 py-1 text-xs font-medium text-shelf-green-dark"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              aria-label={`Remove tag ${tag}`}
              className="text-shelf-green-dark/60 hover:text-shelf-green-dark"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={tags.length === 0 ? "fantasy, book club, favorites…" : ""}
          className="min-w-[8rem] flex-1 border-none bg-transparent p-0.5 text-sm outline-none placeholder:text-ink-faint"
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">
        Press Enter or comma to add a tag · {tags.length}/{MAX_TAGS} used
      </p>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
