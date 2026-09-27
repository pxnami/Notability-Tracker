import type { ReactNode } from "react";
import { useSaved } from "../lib/preferences";
import { SfIcon } from "./ui/SfIcon";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="lede">{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Empty({
  title = "Nothing here yet.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <SfIcon name="search-more" size={28} />
      <h2>{title}</h2>
      <p>{children ?? "Try another search or clear your filters."}</p>
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <label className="search-box">
      <SfIcon name="search-more" size={18} />
      <input
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
      />
    </label>
  );
}
export function SaveButton({ id }: { id: string }) {
  const { saved, toggle } = useSaved();
  const active = saved.includes(id);
  return (
    <button
      className={`icon-button ${active ? "saved" : ""}`}
      title={active ? "Remove bookmark" : "Save item"}
      aria-label={active ? "Remove bookmark" : "Save item"}
      aria-pressed={active}
      onClick={() => toggle(id)}
    >
      <SfIcon name="bookmark-ribbon" size={18} />
    </button>
  );
}
export function SourceLink({
  href,
  children = "Original source",
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <SfIcon name="link" size={14} />
    </a>
  );
}
export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="icon-button"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        <SfIcon name="long-arrow-left" size={19} />
      </button>
      <span>
        Page {page + 1} of {total}
      </span>
      <button
        className="icon-button"
        aria-label="Next page"
        disabled={page + 1 === total}
        onClick={() => onChange(page + 1)}
      >
        <SfIcon name="long-arrow-right" size={19} />
      </button>
    </nav>
  );
}
export function formatDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not specified";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
export function ExportButton({ data, name }: { data: unknown; name: string }) {
  return (
    <button
      className="icon-button"
      title="Export JSON"
      aria-label="Export JSON"
      onClick={() => {
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
    >
      <SfIcon name="download" size={18} />
    </button>
  );
}
