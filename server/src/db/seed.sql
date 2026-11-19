-- =====================================================================
-- StudyLoft - store catalogue (seed data)
-- Task 21 (Sprint 1). Run with: npm run db:seed
--
-- The eight items shown in the store wireframe (docs/images/wf_store.png):
-- name, cost, and tier come from the wireframe. Grid sizes of the desk,
-- bookshelf, and lamp come from the apartment wireframe (wf_apartment.png);
-- the other sizes and the clothing slots were decided by the team.
--
-- The script can be run more than once. An item that already exists
-- (same name) is updated to the values below, so this file is the single
-- source of truth for the catalogue.
-- =====================================================================

INSERT INTO items (name, item_type, cost, tier, grid_width, grid_height, slot) VALUES
    -- furniture: grid_width x grid_height on the apartment grid (FR-11)
    ('Floor lamp',  'furniture',   80, 1, 1, 1, NULL),
    ('Bookshelf',   'furniture',  120, 1, 2, 1, NULL),
    ('Wooden desk', 'furniture',  300, 2, 2, 1, NULL),
    ('Armchair',    'furniture',  450, 2, 1, 1, NULL),
    ('Grand piano', 'furniture', 3000, 4, 2, 2, NULL),
    -- clothing: avatar slot (FR-2)
    ('Hoodie',      'clothing',    60, 1, NULL, NULL, 'top'),
    ('Sneakers',    'clothing',   200, 2, NULL, NULL, 'shoes'),
    ('Winter coat', 'clothing',   900, 3, NULL, NULL, 'outer')
ON CONFLICT (name) DO UPDATE SET
    item_type   = EXCLUDED.item_type,
    cost        = EXCLUDED.cost,
    tier        = EXCLUDED.tier,
    grid_width  = EXCLUDED.grid_width,
    grid_height = EXCLUDED.grid_height,
    slot        = EXCLUDED.slot;
