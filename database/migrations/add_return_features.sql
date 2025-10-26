-- Migration: Add return request features
-- Description: Add columns and enum values for early return feature with admin approval

-- IMPORTANT: This migration must be run in parts due to PostgreSQL enum restrictions
-- Part 1: Add enum value (run this first, then commit)

-- 1. Add PENDING_RETURN to the status enum
-- Note: This must be committed before using the new value
DO $$
BEGIN
    -- Check if enum value already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'PENDING_RETURN'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'borrow_status')
    ) THEN
        ALTER TYPE borrow_status ADD VALUE 'PENDING_RETURN';
    END IF;
END $$;
