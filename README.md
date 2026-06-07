# SplitIt

> Plataforma para reservar servicios y dividir el pago entre amigos.
> Trabajo de Fin de Grado — Rodrigo Cabo, ESIC FP.

SplitIt permite a un usuario reservar un servicio (limpieza, deporte, mantenimiento…), invitar a otras personas a participar en esa reserva y dividir el coste automáticamente entre todas. Cada participante puede pagar con su cartera virtual o tarjeta, y los amigos de confianza pueden activar el **auto-cobro** para pagar sin confirmación.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19**
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + RLS + Storage)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI)

## Requisitos

- Node.js 20+
- Cuenta de Supabase (para crear tu propio proyecto) — [supabase.com](https://supabase.com)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 3. Arrancar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver [`.env.example`](./.env.example). Las variables se obtienen del panel de Supabase: **Project Settings → API**.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build de producción |
| `npm run lint` | Análisis estático con ESLint |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro (sin sesión)
│   ├── (private)/       # Rutas protegidas (con sesión)
│   │   ├── dashboard/
│   │   ├── reservas/
│   │   └── perfil/
│   ├── (public)/        # Catálogo y detalle de servicio (públicos)
│   └── admin/           # Panel administración (rol admin)
├── components/          # UI reusable
├── lib/                 # Clientes Supabase y helpers (auth)
├── types/               # Tipos compartidos
└── proxy.ts             # Middleware de Next 16 (protección de rutas)
```

## Modelo de datos

7 tablas con **Row Level Security activo en todas**:

- `profiles` — usuarios y saldo de cartera
- `services` — catálogo de servicios
- `bookings` — reservas
- `participants` — participantes y estado de pago de cada reserva
- `wallet_transactions` — historial de movimientos
- `trusted_contacts` — amigos y permiso de auto-cobro
- `ratings` — valoraciones de servicios

## Funcionalidades clave

- Reserva con división automática del coste entre N participantes
- Cartera virtual con recarga, pagos y reembolsos
- Auto-cobro entre amigos de confianza
- Cancelación con reembolso automático a la cartera de quienes pagaron
- Detección de solapamiento horario al reservar
- Auto-finalización de reservas cuya fecha ya pasó
- Sistema de valoraciones con comentarios
- Panel de administración para gestionar servicios y reservas
