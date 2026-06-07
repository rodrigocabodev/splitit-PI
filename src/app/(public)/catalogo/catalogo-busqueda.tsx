"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search } from "lucide-react";

export default function CatalogoBusqueda() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    const categoria = searchParams.get("categoria");

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria) params.set("categoria", categoria);

    router.push(`/catalogo${params.size > 0 ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition max-w-sm w-full"
    >
      <Search size={15} className="text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Buscar servicio..."
        className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
      />
    </form>
  );
}
