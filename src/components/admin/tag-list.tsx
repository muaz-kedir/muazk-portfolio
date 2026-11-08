"use client";

import { useState } from "react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";

export function TagList({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  return (
    <div>
      <Input
        id={id}
        value={draft}
        placeholder={placeholder ?? t("admin.common.tagPlaceholder")}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
      />
      {value.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-elevated px-2.5 py-1 text-sm text-content"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="text-faint hover:text-red-400"
                aria-label={t("admin.common.removeTag", { tag })}
              >
                <Icon name="X" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
