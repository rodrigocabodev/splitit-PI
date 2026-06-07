import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageOff, SearchX, Star } from "lucide-react";
import type { Service } from "@/types";
import CatalogoBusqueda from "./catalogo-busqueda";

const CATEGORIAS = ["Todas", "Hogar", "Deporte", "Mantenimiento"];

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const supabase = await createClient();

  const qLimpio = q?.trim().slice(0, 100);

  let query = supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (categoria && categoria !== "Todas") {
    query = query.eq("category", categoria);
  }
  if (qLimpio) {
    query = query.ilike("title", `%${qLimpio}%`);
  }

  const { data: services } = await query;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de servicios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reserva y divide el pago con quien quieras
        </p>
      </div>

      {/* Buscador + filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogoBusqueda />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map((cat) => {
            const isActive = cat === (categoria ?? "Todas");
            const params = new URLSearchParams();
            if (cat !== "Todas") params.set("categoria", cat);
            if (qLimpio) params.set("q", qLimpio);
            const href = `/catalogo${params.size > 0 ? `?${params}` : ""}`;
            return (
              <Link
                key={cat}
                href={href}
                className={buttonVariants({
                  variant: isActive ? "default" : "outline",
                  size: "sm",
                })}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {!services || services.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={qLimpio ? `Sin resultados para "${qLimpio}"` : "No hay servicios en esta categoría"}
          description={qLimpio ? "Prueba con otro término o cambia la categoría." : "Vuelve más tarde o prueba otra categoría."}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: Service, i: number) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Link
      href={`/servicios/${service.id}`}
      className="group border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all flex flex-col bg-card animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      {/* Imagen */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-8" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm shadow-sm">
          {service.category}
        </Badge>
      </div>

      {/* Información */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{service.title}</h2>
        <p className="text-muted-foreground text-xs line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <span className="font-bold text-sm tabular-nums">
            {service.price_per_hour} <span className="text-muted-foreground font-normal text-xs">€/h</span>
          </span>
          {Number(service.rating) > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-foreground">
              <Star className="size-3 fill-warning text-warning" />
              {service.rating}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60">Nuevo</span>
          )}
        </div>
      </div>
    </Link>
  );
}
