"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import { toast } from "@fleetio/ui/toast";

/**
 * SimpleTypeahead.tsx
 * Plain React + Tailwind implementation styled like shadcn (no shadcn components).
 * - Debounced fetch to an API (`apiBase?q=`)
 * - Click/keyboard selection + free-text submit when no suggestions
 * - Minimal, accessible markup
 */

interface Recipe {
  id: number;
  title: string;
  description?: string;
}

interface Props {
  apiBase?: string;
  placeholder?: string;
  onSubmit?: (value: string, selected?: Recipe | null) => void;
  showSearchIcon?: boolean;
}

const searchIcon = (show: boolean) =>
  show ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2 h-4 w-4 opacity-60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-4.35-4.35"
      />
      <circle
        cx="11"
        cy="11"
        r="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  ) : null;

export default function SearchableInput({
  apiBase = "https://dummyjson.com/recipes/search",
  placeholder = "Submit recipes...",
  onSubmit,
  showSearchIcon = false,
}: Props) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const u = new URL(apiBase);
        u.searchParams.set("q", q);
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const hits: any[] = data.recipes || data.items || data.results || [];
        setSuggestions(
          hits.slice(0, 8).map((h) => ({
            id: h.id,
            title: h.title || h.name || "",
            description: h.description,
          })),
        );
        setOpen(true);
        setActive(null);
      } catch (e) {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, apiBase]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!inputRef.current) return;
      if (e.target instanceof Node && inputRef.current.contains(e.target))
        return;
      setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) =>
        a === null ? 0 : Math.min(suggestions.length - 1, a + 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) =>
        a === null ? suggestions.length - 1 : Math.max(0, a - 1),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active !== null && suggestions[active])
        return handleSelect(suggestions[active]);
      handleSubmit(q, null);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(null);
    }
  }

  function handleSelect(item: Recipe) {
    setQ(item.title);
    setOpen(false);
    setActive(null);
    handleSubmit(item.title, item);
  }

  function handleSubmit(value: string, selected: Recipe | null) {
    if (onSubmit) onSubmit(value, selected);
    toast.success(`${value} ${JSON.stringify(selected, null, 4)}`);
  }

  return (
    <div className="w-full max-w-lg">
      <label className="mb-1 block text-sm font-medium">Recipe</label>
      <div className="relative">
        <div className="flex items-center rounded-lg border bg-white px-3 py-2 shadow-sm">
          {searchIcon(showSearchIcon)}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => {
              if (suggestions.length) setOpen(true);
            }}
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder={placeholder}
            aria-label="Search recipes"
          />
        </div>

        {open && (
          <ul className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow-lg">
            {suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-600">
                No suggestions
              </li>
            ) : (
              suggestions.map((s, idx) => (
                <li
                  key={s.id}
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setActive(idx)}
                  className={`cursor-pointer px-3 py-2 text-sm ${active === idx ? "bg-slate-100" : ""}`}
                >
                  <div className="font-medium">{s.title}</div>
                  {s.description ? (
                    <div className="text-xs text-gray-500">{s.description}</div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (active !== null && suggestions[active])
            handleSelect(suggestions[active]);
          else handleSubmit(q, null);
        }}
        className="mt-2 rounded-md border px-3 py-1 text-sm font-medium"
      >
        Submit
      </button>
    </div>
  );
}
