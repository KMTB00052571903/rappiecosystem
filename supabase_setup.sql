-- ============================================================
-- RAPPI ECOSYSTEM - Supabase SQL Setup
-- Run this entire script in the Supabase SQL editor once.
-- ============================================================

-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "userId" UUID NOT NULL
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  "storeId" UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE
);

-- 4. Orders table (Lab 3 + Lab 4 columns)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL,
  "storeId" UUID NOT NULL REFERENCES stores(id),
  "deliveryId" UUID,
  status TEXT NOT NULL DEFAULT 'Creado',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_position GEOGRAPHY(POINT, 4326),
  destination GEOGRAPHY(POINT, 4326) NOT NULL
);

-- 5. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1
);

-- 6. Disable Row Level Security on all tables (lab simplification)
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 7. Enable Supabase Realtime on orders table (for Store App Postgres Changes)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 8. PostgreSQL function: update delivery position + check arrival with ST_DWithin
--    Called by PATCH /api/orders/:id/position
CREATE OR REPLACE FUNCTION update_order_position(
  p_order_id UUID,
  p_lat FLOAT,
  p_lng FLOAT
) RETURNS TEXT AS $$
DECLARE
  v_arrived BOOLEAN;
  v_current_status TEXT;
BEGIN
  -- Only update if order is still in delivery
  SELECT status INTO v_current_status FROM orders WHERE id = p_order_id;
  IF v_current_status = 'Entregado' THEN
    RETURN 'Entregado';
  END IF;

  -- Update delivery_position
  UPDATE orders
  SET delivery_position = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  WHERE id = p_order_id;

  -- Check if within 5 meters of destination using ST_DWithin
  SELECT ST_DWithin(delivery_position, destination, 5) INTO v_arrived
  FROM orders
  WHERE id = p_order_id
    AND delivery_position IS NOT NULL
    AND destination IS NOT NULL;

  IF v_arrived THEN
    UPDATE orders SET status = 'Entregado' WHERE id = p_order_id;
    RETURN 'Entregado';
  END IF;

  RETURN 'En entrega';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
