"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  defaultTab: string;
  solicitudesCount: number;
  paymentsCount: number;
  carteraContent: React.ReactNode;
  amigosContent: React.ReactNode;
  cuentaContent: React.ReactNode;
};

// Wrapper cliente para las tabs del perfil.
// Usamos "value" controlado (no defaultValue) para evitar el warning
// de Base UI sobre cambios en estado no controlado tras la hidratación.
export default function PerfilTabs({
  defaultTab,
  solicitudesCount,
  paymentsCount,
  carteraContent,
  amigosContent,
  cuentaContent,
}: Props) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full">
        <TabsTrigger value="cartera" className="flex-1 gap-1.5">
          Cartera
          {paymentsCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
              {paymentsCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="amigos" className="flex-1 gap-1.5">
          Amigos
          {solicitudesCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {solicitudesCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="cuenta" className="flex-1">
          Cuenta
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cartera" className="mt-4 flex flex-col gap-4">
        {carteraContent}
      </TabsContent>

      <TabsContent value="amigos" className="mt-4">
        {amigosContent}
      </TabsContent>

      <TabsContent value="cuenta" className="mt-4 flex flex-col gap-6">
        {cuentaContent}
      </TabsContent>
    </Tabs>
  );
}
