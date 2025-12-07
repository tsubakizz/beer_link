-- Enable RLS on all tables
-- This prevents direct access via Supabase anon key
-- Drizzle with postgres user bypasses RLS, so app continues to work

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prefectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE breweries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beer_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE beer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE beer_style_requests ENABLE ROW LEVEL SECURITY;

-- No policies = all access denied via anon/authenticated roles
-- postgres user (used by Drizzle) has superuser privileges and bypasses RLS
