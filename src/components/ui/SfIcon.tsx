import type { CSSProperties } from "react";

export type SfIconName =
  | "bookmark-ribbon"
  | "bug"
  | "checked"
  | "close-window"
  | "code-fork"
  | "connection-sync"
  | "download"
  | "github"
  | "link"
  | "long-arrow-left"
  | "long-arrow-right"
  | "menu-2"
  | "moon-symbol"
  | "search-more"
  | "sparkles"
  | "sun";

export function SfIcon({
  name,
  size = 18,
  className = "",
}: {
  name: SfIconName;
  size?: number;
  className?: string;
}) {
  const style = {
    "--sf-icon": `url("${import.meta.env.BASE_URL}icons/sf/${name}.png")`,
    "--sf-icon-size": `${size}px`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={`sf-icon ${className}`.trim()}
      style={style}
    />
  );
}
