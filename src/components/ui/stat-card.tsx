import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  href?: string;
  accent?: "primary" | "success" | "warning" | "info";
  className?: string;
};

export function StatCard({ label, value, icon: Icon, href, accent = "primary", className }: Props) {
  const accentBg = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  }[accent];

  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0", accentBg)}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
