-- Add the slug column to older service_categories tables.
ALTER TABLE service_categories
ADD COLUMN slug TEXT;

-- Populate slugs for existing service categories.
UPDATE service_categories
SET slug = CASE LOWER(TRIM(name))
    WHEN 'electrician' THEN 'electrician'
    WHEN 'plumber' THEN 'plumber'
    WHEN 'carpenter' THEN 'carpenter'
    WHEN 'painter' THEN 'painter'
    WHEN 'cook' THEN 'cook'
    WHEN 'cleaner' THEN 'cleaner'
    WHEN 'maid' THEN 'maid'
    WHEN 'babysitter' THEN 'babysitter'
    WHEN 'ac repair' THEN 'ac_repair'
    WHEN 'driver' THEN 'driver'
    WHEN 'security guard' THEN 'security'
    WHEN 'gardener' THEN 'gardener'
    WHEN 'pest control' THEN 'pest_control'
    ELSE LOWER(REPLACE(TRIM(name), ' ', '_'))
END
WHERE slug IS NULL OR TRIM(slug) = '';

-- Ensure populated slugs are unique.
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_categories_slug
ON service_categories(slug);