import { Clock, Check, X, CheckCircle2, CreditCard, Wallet, Undo2, Ban } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type BookingStatus = "pending" | "confirmed" | "finished" | "cancelled";
type PaymentStatus = "pending" | "paid" | "refunded" | "unpaid";

type Props = {
  kind: "booking" | "payment";
  status: BookingStatus | PaymentStatus;
  className?: string;
};

const BOOKING_MAP: Record<BookingStatus, { label: string; icon: React.ElementType; classes: string }> = {
  pending:   { label: "Pendiente",  icon: Clock,         classes: "bg-warning/15 text-warning-foreground border-warning/30" },
  confirmed: { label: "Confirmada", icon: CheckCircle2,  classes: "bg-info/15 text-info border-info/30" },
  finished:  { label: "Finalizada", icon: Check,         classes: "bg-success/15 text-success border-success/30" },
  cancelled: { label: "Cancelada",  icon: X,             classes: "bg-destructive/10 text-destructive border-destructive/30" },
};

const PAYMENT_MAP: Record<PaymentStatus, { label: string; icon: React.ElementType; classes: string }> = {
  pending:  { label: "Pendiente",   icon: CreditCard, classes: "bg-warning/15 text-warning-foreground border-warning/30" },
  paid:     { label: "Pagado",      icon: Wallet,     classes: "bg-success/15 text-success border-success/30" },
  refunded: { label: "Reembolsado", icon: Undo2,      classes: "bg-info/15 text-info border-info/30" },
  unpaid:   { label: "No pagó",     icon: Ban,        classes: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function StatusBadge({ kind, status, className }: Props) {
  const map = kind === "booking" ? BOOKING_MAP : PAYMENT_MAP;
  const entry = (map as Record<string, { label: string; icon: React.ElementType; classes: string }>)[status];
  if (!entry) return null;
  const Icon = entry.icon;
  return (
    <Badge variant="outline" className={cn(entry.classes, "border gap-1", className)}>
      <Icon className="size-3" />
      {entry.label}
    </Badge>
  );
}
