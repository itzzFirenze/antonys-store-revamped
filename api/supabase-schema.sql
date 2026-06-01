-- =============================================
-- Antony's Boutique — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
   name        TEXT        NOT NULL,
   email       TEXT        UNIQUE NOT NULL,
   password    TEXT        NOT NULL,
   mob_num     TEXT        DEFAULT 'Not added',
   address     TEXT        DEFAULT 'Not added',
   pincode     TEXT        DEFAULT 'Not added',
   is_admin    BOOLEAN     DEFAULT FALSE,
   reset_code  TEXT,
   reset_code_expires TIMESTAMPTZ,
   created_at  TIMESTAMPTZ DEFAULT NOW(),
   updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Product Counter (for sequential IDs)
-- =============================================
CREATE TABLE IF NOT EXISTS product_counter (
   id  TEXT    DEFAULT 'productCounter' PRIMARY KEY,
   seq INTEGER DEFAULT 0
);

INSERT INTO product_counter (id, seq) VALUES ('productCounter', 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Products Table
-- =============================================
CREATE TABLE IF NOT EXISTS products (
   id              TEXT        PRIMARY KEY,
   name            TEXT        NOT NULL,
   brand           TEXT        NOT NULL,
   price           NUMERIC     NOT NULL,
   color           TEXT        NOT NULL,
   category        TEXT        NOT NULL,
   count_in_stock  INTEGER     NOT NULL DEFAULT 0,
   image           TEXT,
   sizes           JSONB       DEFAULT '{"S":0,"M":0,"L":0,"XL":0,"XXL":0}'::jsonb,
   created_at      TIMESTAMPTZ DEFAULT NOW(),
   updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Wishlist Table
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist (
   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
   user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   product_id  TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
   created_at  TIMESTAMPTZ DEFAULT NOW(),
   UNIQUE(user_id, product_id)
);

-- =============================================
-- Email Verification Codes Table
-- =============================================
CREATE TABLE IF NOT EXISTS verification_codes (
   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
   email       TEXT        NOT NULL,
   code        TEXT        NOT NULL,
   expires_at  TIMESTAMPTZ NOT NULL,
   created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Clean up stale verification codes automatically
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
   id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
   order_id            TEXT        UNIQUE,
   user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   product_id          TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
   size                TEXT,
   is_pending          BOOLEAN     DEFAULT TRUE,
   is_completed        BOOLEAN     DEFAULT FALSE,
   is_req_payment      BOOLEAN     DEFAULT FALSE,
   address             TEXT        NOT NULL,
   pincode             TEXT        NOT NULL,
   phone_number        TEXT        NOT NULL,
   additional_details  TEXT        DEFAULT '',
   want_stitched       BOOLEAN     DEFAULT FALSE,

   -- Measurement fields
   length              NUMERIC,
   chest               NUMERIC,
   waist               NUMERIC,
   hip                 NUMERIC,
   arm_fit             NUMERIC,
   sleeve_length       NUMERIC,
   sleeve_width        NUMERIC,
   back_neck           NUMERIC,
   front_neck          NUMERIC,

   approved_at         TIMESTAMPTZ,
   payment_requested_at TIMESTAMPTZ,
   created_at          TIMESTAMPTZ DEFAULT NOW(),
   updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id   ON orders(order_id);

-- =============================================
-- RLS Policies (Row Level Security)
-- =============================================
-- Disable RLS for all tables since we use service role key from backend
ALTER TABLE users               DISABLE ROW LEVEL SECURITY;
ALTER TABLE products            DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist            DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes  DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_counter     DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders              DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
   BEFORE UPDATE ON users
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
   BEFORE UPDATE ON products
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
   BEFORE UPDATE ON orders
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
