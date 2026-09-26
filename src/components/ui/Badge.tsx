import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

const variants = {
  blue: "bg-notability-50 text-notability-700 dark:bg-notability-500/15 dark:text-notability-100",
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-100",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-100"
};

export function Badge({ children, variant = "gray" }: PropsWithChildren<{ variant?: keyof typeof variants }>) {
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", variants[variant])}>{children}</span>;
}
