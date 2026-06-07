import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

type Props = {
  value: number | string | null | undefined;
  tone?: "default" | "muted" | "positive" | "negative" | "warning";
  className?: string;
};

export function Money({ value, tone = "default", className }: Props) {
  const toneClass = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    positive: "text-success",
    negative: "text-destructive",
    warning: "text-warning-foreground",
  }[tone];
  return <span className={cn("font-semibold tabular-nums", toneClass, className)}>{formatMoney(value)}</span>;
}
