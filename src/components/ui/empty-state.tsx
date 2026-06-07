import { cn } from "@/lib/utils";

type Props = {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-border rounded-xl px-6 py-12 flex flex-col items-center justify-center gap-3 text-center bg-muted/30",
        className,
      )}
    >
      {Icon && (
        <div className="size-12 rounded-full bg-background flex items-center justify-center ring-1 ring-border">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
