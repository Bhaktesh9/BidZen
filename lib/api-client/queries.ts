import apiCall from '.';
import { User, Team, Player, AuctionState } from '@/types';

/**
 * Login user with credentials
 */
export async function login(username: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    needsAuth: false,
  });
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  return apiCall<User>('/auth/me');
}

/**
 * Logout user
 */
export async function logout() {
  return apiCall('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Get all teams
 */
export async function getTeams() {
  return apiCall<Team[]>('/teams');
}

/**
 * Get team by ID
 */
export async function getTeam(teamId: string) {
  return apiCall<Team>(`/teams/${teamId}`);
}

/**
 * Get all players
 */
export async function getPlayers() {
  return apiCall<Player[]>('/players');
}

/**
 * Get players in batch
 */
export async function getPlayersByBatch(batchNumber: number) {
  return apiCall<Player[]>(`/players?batch=${batchNumber}`);
}

/**
 * Get auction state
 */
export async function getAuctionState() {
  return apiCall<AuctionState>('/auction/state');
}

/**
 * Start auction (Presenter)
 */
export async function startAuction() {
  return apiCall('/auction/start', {
    method: 'POST',
  });
}

/**
 * Submit bid (Controller)
 */
export async function submitBid(finalPrice: number, winningTeamId: string) {
  return apiCall('/auction/bid', {
    method: 'POST',
    body: JSON.stringify({
      final_bid_price: finalPrice,
      winning_team_id: winningTeamId,
    }),
  });
}

/**
 * Get next player in auction
 */
export async function getNextPlayer() {
  return apiCall<Player>('/auction/next-player');
}

/**
 * Admin: Create user
 */
export async function createUser(username: string, password: string, role: string, teamId?: string) {
  return apiCall('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      role,
      team_id: teamId,
    }),
  });
}

/**
 * Admin: Get all users
 */
export async function getUsers() {
  return apiCall<User[]>('/admin/users');
}

/**
 * Admin: Reset user password
 */
export async function resetPassword(userId: string, newPassword: string) {
  return apiCall(`/admin/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword }),
  });
}

/**
 * Admin: Create team
 */
export async function createTeam(name: string) {
  return apiCall<Team>('/admin/teams', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

/**
 * Admin: Update team
 */
export async function updateTeam(teamId: string, data: Partial<Team>) {
  return apiCall<Team>(`/admin/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: Delete team
 */
export async function deleteTeam(teamId: string) {
  return apiCall(`/admin/teams/${teamId}`, {
    method: 'DELETE',
  });
}

/**
 * Admin: Create player
 */
export async function createPlayer(
  name: string,
  role: string,
  basePrice: number,
  batchNumber: number,
  imageUrl?: string
) {
  return apiCall<Player>('/admin/players', {
    method: 'POST',
    body: JSON.stringify({
      name,
      role,
      base_price: basePrice,
      batch_number: batchNumber,
      image_url: imageUrl,
    }),
  });
}

/**
 * Admin: Get all players
 */
export async function getAllPlayers() {
  return apiCall<Player[]>('/admin/players');
}

/**
 * Admin: Update player
 */
export async function updatePlayer(playerId: string, data: Partial<Player>) {
  return apiCall<Player>(`/admin/players/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: Delete player
 */
export async function deletePlayer(playerId: string) {
  return apiCall(`/admin/players/${playerId}`, {
    method: 'DELETE',
  });
}
