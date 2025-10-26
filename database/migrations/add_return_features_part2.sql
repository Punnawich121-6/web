-- Migration Part 2: Add columns and indexes
-- Run this AFTER running part 1 (add_return_features.sql) and committing the transaction

-- 1. Add columns for tracking return requests
ALTER TABLE borrow_requests
ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_confirmed_by UUID,
ADD COLUMN IF NOT EXISTS return_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 2. Add foreign key constraint for return_confirmed_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'borrow_requests_return_confirmed_by_fkey'
        AND table_name = 'borrow_requests'
    ) THEN
        ALTER TABLE borrow_requests
        ADD CONSTRAINT borrow_requests_return_confirmed_by_fkey
        FOREIGN KEY (return_confirmed_by) REFERENCES users(id);
    END IF;
END $$;

-- 3. Add index for faster queries on return_requested_at
CREATE INDEX IF NOT EXISTS idx_borrow_requests_return_requested_at
ON borrow_requests(return_requested_at)
WHERE return_requested_at IS NOT NULL;

-- 4. Add index for pending return status
-- Now safe to use PENDING_RETURN since it was committed in part 1
CREATE INDEX IF NOT EXISTS idx_borrow_requests_pending_return
ON borrow_requests(status)
WHERE status = 'PENDING_RETURN';

-- 5. Add comments for documentation
COMMENT ON COLUMN borrow_requests.return_requested_at IS 'Timestamp when user requested to return the item early';
COMMENT ON COLUMN borrow_requests.return_confirmed_by IS 'Admin/Moderator who confirmed the return';
COMMENT ON COLUMN borrow_requests.return_confirmed_at IS 'Timestamp when admin confirmed the return';
