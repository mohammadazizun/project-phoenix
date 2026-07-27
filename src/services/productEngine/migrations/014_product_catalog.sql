-- =============================================================================
-- PROJECT PHOENIX: ENTERPRISE EXECUTION-014
-- MIGRATION: Product Catalog Master Supporting Tables & RLS (v3.5)
-- =============================================================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    description TEXT DEFAULT NULL,
    parent_id VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT fk_categories_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_org_code ON product_categories (organization_id, code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_org ON product_categories (organization_id) WHERE deleted_at IS NULL;

-- 2. Product Brands Table
CREATE TABLE IF NOT EXISTS product_brands (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    logo_url TEXT DEFAULT NULL,
    website TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT fk_brands_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_org_code ON product_brands (organization_id, code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_brands_org ON product_brands (organization_id) WHERE deleted_at IS NULL;

-- 3. Product Units Table
CREATE TABLE IF NOT EXISTS product_units (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(32) NOT NULL,
    symbol VARCHAR(16) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT fk_units_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_units_org_code ON product_units (organization_id, code) WHERE deleted_at IS NULL;

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    alt_text VARCHAR(255) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_images_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images (organization_id, product_id);

-- 5. Product Tags Table
CREATE TABLE IF NOT EXISTS product_tags (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32) NOT NULL DEFAULT 'indigo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tags_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_org_name ON product_tags (organization_id, name);

-- 6. Schema Alterations on products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"allowDiscounts": true, "isTaxable": true, "taxRate": 10, "trackSerialNumbers": false, "barcodeType": "EAN-13", "allowBackorders": false, "defaultLeadTimeDays": 7}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Row-Level Security Policies for Master Tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Category Isolation
DROP POLICY IF EXISTS product_categories_tenant_policy ON product_categories;
CREATE POLICY product_categories_tenant_policy ON product_categories
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Brand Isolation
DROP POLICY IF EXISTS product_brands_tenant_policy ON product_brands;
CREATE POLICY product_brands_tenant_policy ON product_brands
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Unit Isolation
DROP POLICY IF EXISTS product_units_tenant_policy ON product_units;
CREATE POLICY product_units_tenant_policy ON product_units
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Image Isolation
DROP POLICY IF EXISTS product_images_tenant_policy ON product_images;
CREATE POLICY product_images_tenant_policy ON product_images
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Tag Isolation
DROP POLICY IF EXISTS product_tags_tenant_policy ON product_tags;
CREATE POLICY product_tags_tenant_policy ON product_tags
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));
