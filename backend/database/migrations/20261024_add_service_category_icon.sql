-- Add the icon column to older service_categories tables.
-- On a fresh DB this column already exists from schema.sql, making this a no-op.
-- On legacy databases this migration has already been applied.
SELECT 1;