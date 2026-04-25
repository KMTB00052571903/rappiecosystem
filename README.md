# 🛵 Mini Rappi — Lab 4: Real-time Delivery Tracking

Ecosistema inspirado en Rappi con seguimiento de entregas en tiempo real usando mapas interactivos, geolocalización y Supabase Realtime.

## 🏗️ Arquitectura

```
rappiecosystem/
├── backend/        # Express + TypeScript — API REST
├── consumer/       # HTML/JS — App del consumidor
├── delivery/       # HTML/JS — App del repartidor
└── store/          # HTML/JS — App de la tienda
```

## 🚀 Tecnologías

- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: Supabase (PostgreSQL + PostGIS)
- **Tiempo real**: Supabase Realtime (Broadcast)
- **Mapas**: Leaflet.js
- **Deploy**: Vercel

## 📦 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/stores` | Listar tiendas |
| GET | `/api/products?storeId=` | Productos por tienda |
| POST | `/api/orders` | Crear pedido con destino en mapa |
| PATCH | `/api/orders/:id/accept` | Repartidor acepta pedido |
| PATCH | `/api/orders/:id/position` | Actualizar posición GPS del repartidor |
| GET | `/api/orders/:id` | Detalle del pedido |

## 🗄️ Modelo de datos — tabla `orders`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `status` | TEXT | `Creado` / `En entrega` / `Entregado` |
| `destination` | GEOGRAPHY(POINT, 4326) | Punto de entrega seleccionado por el consumidor |
| `delivery_position` | GEOGRAPHY(POINT, 4326) | Posición actual del repartidor |

## ⚙️ Enum de estados (TypeScript)

```typescript
enum OrderStatus {
  CREATED    = 'Creado',
  IN_DELIVERY = 'En entrega',
  DELIVERED  = 'Entregado',
}
```

## 🔄 Flujo de tiempo real

1. **Consumer** hace click en el mapa → selecciona destino → crea pedido
2. **Delivery** acepta el pedido → aparece mapa con destino 📍 y su posición 🛵
3. **Delivery** se mueve con teclas `↑ ↓ ← →` (throttle 1 seg) → PATCH `/position`
4. **Consumer** ve la posición del repartidor actualizarse en vivo via Supabase Broadcast
5. Al llegar a **< 5 metros** → `ST_DWithin` detecta llegada → status cambia a `Entregado`
6. **Consumer** recibe notificación visual de llegada
7. **Store** ve badges `Creado / En entrega / Entregado` actualizándose en tiempo real

## 🌐 URLs de producción

- **Backend**: https://rappiecosystem-oopf.vercel.app
- **Consumer**: (URL de Vercel del consumer)
- **Delivery**: (URL de Vercel del delivery)
- **Store**: (URL de Vercel del store)

## 🛠️ Correr localmente

```bash
# Backend
cd backend
npm install
npm run dev

# Consumer / Delivery / Store
# Abrir index.html con Live Server en VS Code
```

### Variables de entorno (backend/.env)

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
PORT=3000
```
