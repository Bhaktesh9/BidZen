// Role types
export type UserRole = 'super_admin' | 'presenter' | 'controller' | 'team_owner';

// User types
export interface User {
  id: string;
  username: string;
  role: UserRole;
  team_id: string | null;
  created_at: string;
}

export interface UserSession {
  user: User;
  token: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  points: number;
  created_at: string;
}

// Player types
export interface Player {
  id: string;
  name: string;
  role: string;
  image_url: string;
  base_price: number;
  batch_number: number;
  sold_price: number | null;
  team_id: string | null;
  created_at: string;
}

// Auction state types
export interface AuctionState {
  id: string;
  current_batch: number;
  current_player_index: number;
  auction_started: boolean;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Auction action types
export interface BidSubmission {
  final_bid_price: number;
  winning_team_id: string;
}
