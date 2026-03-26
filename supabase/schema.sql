-- ===================================
-- BidZen Auction System - Supabase Schema
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TEAMS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  points INTEGER DEFAULT 10000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- USERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'presenter', 'controller', 'team_owner')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- PLAYERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  image_url TEXT,
  base_price INTEGER NOT NULL,
  batch_number INTEGER NOT NULL,
  sold_price INTEGER,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- AUCTION STATE TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS auction_state (
  id UUID PRIMARY KEY DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  current_batch INTEGER DEFAULT 1,
  current_player_index INTEGER DEFAULT 0,
  auction_started BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial auction state
INSERT INTO auction_state (id, current_batch, current_player_index, auction_started)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 0, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_players_batch_number ON players(batch_number);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_state ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data (or admins can view all)
-- Note: This is simplified. In production, you'd use Supabase Auth integration
CREATE POLICY "allow_view_own_user" ON users
  FOR SELECT
  USING (true); -- Handled in application layer

CREATE POLICY "allow_all_users" ON teams
  FOR SELECT
  USING (true);

CREATE POLICY "allow_all_players" ON players
  FOR SELECT
  USING (true);

CREATE POLICY "allow_all_auction_state" ON auction_state
  FOR SELECT
  USING (true);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_state_updated_at
  BEFORE UPDATE ON auction_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SEED DATA (Optional - for testing)
-- ===================================

-- Insert Teams
INSERT INTO teams (id, name, points) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Team Alpha', 10000),
  ('550e8400-e29b-41d4-a716-446655440002', 'Team Beta', 10000),
  ('550e8400-e29b-41d4-a716-446655440003', 'Team Gamma', 10000)
ON CONFLICT DO NOTHING;

-- Create a super admin user (password: admin123 - CHANGE IN PRODUCTION)
-- You'll need to run the hash generation in your app
INSERT INTO users (id, username, password, role, team_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440099', 'admin', '$2a$10$YourHashedPasswordHere', 'super_admin', NULL)
ON CONFLICT (username) DO NOTHING;
