import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

const variants = {
  blue: "bg-[var(--blue-light)] text-[var(--ink)]",
  gray: "bg-[var(--soft)] text-[var(--ink)]",
  green: "bg-[var(--green)] text-[var(--ink)]",
  amber: "bg-[var(--yellow)] text-[var(--ink)]",
  red: "bg-[var(--peach)] text-[var(--ink)]",
};

export function Badge({
  children,
  variant = "gray",
}: PropsWithChildren<{ variant?: keyof typeof variants }>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}
