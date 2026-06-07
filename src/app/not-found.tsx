import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-8xl font-bold text-gray-100 select-none">404</p>
      <h1 className="text-xl font-semibold -mt-4">Página no encontrada</h1>
      <p className="text-gray-500 text-sm max-w-xs">
        Lo que buscas no existe o ya no está disponible.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className={buttonVariants()}>
          Ir al inicio
        </Link>
        <Link href="/catalogo" className={buttonVariants({ variant: "outline" })}>
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
