-- =============================================================================
-- PROJECT PHOENIX: ENTERPRISE EXECUTION-009
-- MIGRATION: Customer Receivables Foundation Schema
-- =============================================================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Receivables Master Table
CREATE TABLE IF NOT EXISTS receivables (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organization_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    reference_number VARCHAR(64) NOT NULL,
    reference_type VARCHAR(32) NOT NULL DEFAULT 'MANUAL_ENTRY',
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(15, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'partially_paid', 'paid', 'cancelled')),
    due_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Foreign Key Constraints (Soft-linked for enterprise module decoupling)
    CONSTRAINT fk_receivables_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_receivables_customer FOREIGN KEY (customer_id) REFERENCES crm_contacts(id) ON DELETE RESTRICT
);

-- Performance & Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_receivables_org_cust ON receivables (organization_id, customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables (due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_receivables_ref_num ON receivables (organization_id, reference_number);

-- Row-Level Security (RLS) Policy Setup
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policy
CREATE POLICY receivables_tenant_isolation_policy ON receivables
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true))
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_receivables_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_receivables_updated_at ON receivables;
CREATE TRIGGER trigger_receivables_updated_at
    BEFORE UPDATE ON receivables
    FOR EACH ROW
    EXECUTE FUNCTION update_receivables_modtime();
