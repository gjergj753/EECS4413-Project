-- Make orders.user_id nullable to allow orphaned orders when user is deleted
-- This preserves order history for audit purposes

ALTER TABLE orders MODIFY COLUMN user_id BIGINT NULL;

