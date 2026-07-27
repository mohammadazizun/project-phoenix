-- =============================================================================
-- PROJECT PHOENIX: ENTERPRISE EXECUTION-011
-- MIGRATION: Product Foundation & Master Catalog Schema (v3.2)
-- =============================================================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Master Product Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'PCS',
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    minimum_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (minimum_stock >= 0),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'draft')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Foreign Key Constraint to Organization
    CONSTRAINT fk_products_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Performance & Query Optimization Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_org_sku ON products (organization_id, sku) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_org_barcode ON products (organization_id, barcode) WHERE barcode IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_status ON products (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_name ON products (organization_id, product_name) WHERE deleted_at IS NULL;

-- Row-Level Security (RLS) Policy Setup
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policy
DROP POLICY IF EXISTS products_tenant_isolation_policy ON products;
CREATE POLICY products_tenant_isolation_policy ON products
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true))
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_modtime();
