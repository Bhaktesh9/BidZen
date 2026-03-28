'use client';

import React, { useState } from 'react';
import { User, Team, Player } from '@/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AdminDashboardProps {
  activeTab: 'users' | 'teams' | 'players';
  users: User[];
  teams: Team[];
  players: Player[];
  onCreateUser: (username: string, password: string, role: string, teamId?: string) => Promise<boolean>;
  onCreateTeam: (name: string) => Promise<void>;
  onCreatePlayer: (name: string, role: string, basePrice: number, batch: number, imageUrl?: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onDeletePlayer: (playerId: string) => Promise<void>;
  onReassignPlayerTeam: (playerId: string, teamId: string | null) => Promise<void>;
  onResetAuction: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success?: string | null;
}

export function AdminDashboard({
  activeTab,
  users,
  teams,
  players,
  onCreateUser,
  onCreateTeam,
  onCreatePlayer,
  onDeleteUser,
  onDeleteTeam,
  onDeletePlayer,
  onReassignPlayerTeam,
  onResetAuction,
  isLoading,
  error,
  success,
}: AdminDashboardProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showResetAuctionModal, setShowResetAuctionModal] = useState(false);
  const [showTeamSquadModal, setShowTeamSquadModal] = useState(false);
  const [selectedTeamForSquad, setSelectedTeamForSquad] = useState<Team | null>(null);
  const [playerTeamSelections, setPlayerTeamSelections] = useState<Record<string, string>>({});

  // Form states
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'presenter', teamId: '' });
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [playerForm, setPlayerForm] = useState({
    name: '',
    role: '',
    basePrice: '',
    batch: '',
    imageUrl: '',
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formatBatchLabel = (batchNumber: number) =>
    batchNumber === 10 ? 'Unsold Batch' : `Batch ${batchNumber}`;

  const sortedPlayers = [...players].sort((firstPlayer, secondPlayer) => {
    if (firstPlayer.batch_number !== secondPlayer.batch_number) {
      return firstPlayer.batch_number - secondPlayer.batch_number;
    }

    const firstCreatedAt = new Date(firstPlayer.created_at).getTime();
    const secondCreatedAt = new Date(secondPlayer.created_at).getTime();

    if (firstCreatedAt !== secondCreatedAt) {
      return firstCreatedAt - secondCreatedAt;
    }

    return firstPlayer.id.localeCompare(secondPlayer.id);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Loading admin dashboard..." />
      </div>
    );
  }

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      const created = await onCreateUser(
        userForm.username,
        userForm.password,
        userForm.role,
        userForm.teamId
      );

      if (created) {
        setUserForm({ username: '', password: '', role: 'presenter', teamId: '' });
        setShowUserModal(false);
        setShowUserPassword(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async () => {
    setIsSubmitting(true);
    try {
      await onCreateTeam(teamForm.name);
      setTeamForm({ name: '' });
      setShowTeamModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlayer = async () => {
    setIsSubmitting(true);
    try {
      await onCreatePlayer(
        playerForm.name,
        playerForm.role,
        parseInt(playerForm.basePrice),
        parseInt(playerForm.batch),
        playerForm.imageUrl
      );
      setPlayerForm({ name: '', role: '', basePrice: '', batch: '', imageUrl: '' });
      setShowPlayerModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAuction = async () => {
    setIsSubmitting(true);
    try {
      await onResetAuction();
      setShowResetAuctionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTeamForPlayer = (player: Player) => {
    if (player.id in playerTeamSelections) {
      return playerTeamSelections[player.id];
    }
    return player.team_id || '';
  };

  const handleApplyPlayerTeam = async (player: Player) => {
    const selectedTeam = getSelectedTeamForPlayer(player);
    const normalizedTeam = selectedTeam || null;

    if (normalizedTeam === player.team_id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onReassignPlayerTeam(player.id, normalizedTeam);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-danger/15 border border-danger/40 text-danger p-4 rounded-smpanel mb-6 font-mono text-xs tracking-wide">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/15 border border-success/40 text-success p-4 rounded-smpanel mb-6 font-mono text-xs tracking-wide">
            {success}
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-textPrimary mb-2">Super Admin</h1>
        <p className="bz-sub mb-6">MANAGE USERS, TEAMS & PLAYERS</p>

        <div className="mb-4 sm:mb-6">
          <Button variant="danger" onClick={() => setShowResetAuctionModal(true)} className="w-full sm:w-auto">
            Reset Auction
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-2xl font-display font-bold text-textPrimary">Users</h2>
              <Button onClick={() => setShowUserModal(true)} className="w-full sm:w-auto">Create User</Button>
            </div>

            <div className="md:hidden space-y-3">
              {users.map((user) => {
                const userTeam = teams.find((team) => team.id === user.team_id);
                return (
                  <div key={user.id} className="border border-subtle bg-elevated rounded-smpanel p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-textPrimary font-semibold break-words">{user.username}</p>
                        <p className="text-xs text-textSecondary capitalize mt-1">{user.role.replace('_', ' ')}</p>
                        <p className="text-xs text-textMuted mt-1">Team: {userTeam?.name || '-'}</p>
                      </div>
                      <Button size="sm" variant="danger" onClick={() => onDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userTeam = teams.find((t) => t.id === user.team_id);
                    return (
                      <tr key={user.id} className="border-t border-subtle hover:bg-white/5">
                        <td className="px-6 py-3 text-textPrimary">{user.username}</td>
                        <td className="px-6 py-3 text-textSecondary capitalize">{user.role.replace('_', ' ')}</td>
                        <td className="px-6 py-3 text-textSecondary">{userTeam?.name || '-'}</td>
                        <td className="px-6 py-3">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-2xl font-display font-bold text-textPrimary">Teams</h2>
              <Button onClick={() => setShowTeamModal(true)} className="w-full sm:w-auto">Create Team</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="border border-subtle bg-elevated rounded-smpanel p-3 sm:p-4 cursor-pointer hover:border-primary hover:bg-elevated/80 transition-all"
                  onClick={() => {
                    setSelectedTeamForSquad(team);
                    setShowTeamSquadModal(true);
                  }}
                >
                  <h3 className="text-base sm:text-lg font-bold text-textPrimary mb-1 break-words">{team.name}</h3>
                  <p className="text-sm text-textSecondary mb-2">Points: ${team.points.toLocaleString()}</p>
                  <p className="text-xs text-textMuted mb-3">
                    Players: {players.filter((p) => p.team_id === team.id).length}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-primary/80 mb-3">Tap to view squad</p>
                  <Button
                    size="sm"
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTeam(team.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-2xl font-display font-bold text-textPrimary">Players</h2>
              <Button onClick={() => setShowPlayerModal(true)} className="w-full sm:w-auto">Create Player</Button>
            </div>

            <div className="md:hidden space-y-3">
              {sortedPlayers.map((player) => {
                const playerTeam = teams.find((team) => team.id === player.team_id);
                return (
                  <div key={player.id} className="border border-subtle bg-elevated rounded-smpanel p-3 space-y-3">
                    <div>
                      <p className="text-textPrimary font-semibold break-words">{player.name}</p>
                      <p className="text-xs text-textSecondary">{player.role}</p>
                      <p className="text-xs text-textMuted mt-1">{formatBatchLabel(player.batch_number)} · ${player.base_price}</p>
                      <p className="text-xs text-textMuted">Team: {playerTeam?.name || '-'}</p>
                    </div>

                    <select
                      value={getSelectedTeamForPlayer(player)}
                      onChange={(e) =>
                        setPlayerTeamSelections((prev) => ({
                          ...prev,
                          [player.id]: e.target.value,
                        }))
                      }
                      className="bz-select"
                    >
                      <option value="">No team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApplyPlayerTeam(player)}
                        disabled={isSubmitting}
                      >
                        Update Team
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDeletePlayer(player.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textMuted uppercase tracking-wider font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player) => {
                    const playerTeam = teams.find((t) => t.id === player.team_id);
                    return (
                      <tr key={player.id} className="border-t border-subtle hover:bg-white/5">
                        <td className="px-6 py-3 text-textPrimary">{player.name}</td>
                        <td className="px-6 py-3 text-textSecondary">{player.role}</td>
                        <td className="px-6 py-3 text-textSecondary">{player.batch_number === 10 ? 'Unsold Batch' : player.batch_number}</td>
                        <td className="px-6 py-3 text-textSecondary">${player.base_price}</td>
                        <td className="px-6 py-3 text-textSecondary">{playerTeam?.name || '-'}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={getSelectedTeamForPlayer(player)}
                              onChange={(e) =>
                                setPlayerTeamSelections((prev) => ({
                                  ...prev,
                                  [player.id]: e.target.value,
                                }))
                              }
                              className="bz-select min-w-[150px] py-2"
                            >
                              <option value="">No team</option>
                              {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name}
                                </option>
                              ))}
                            </select>

                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApplyPlayerTeam(player)}
                              disabled={isSubmitting}
                            >
                              Update Team
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => onDeletePlayer(player.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modals */}
        <Modal
          isOpen={showUserModal}
          title="Create User"
          onClose={() => setShowUserModal(false)}
          onConfirm={handleCreateUser}
          confirmText="Create"
          isDangerous={false}
        >
          <div className="space-y-4">
            <div>
              <label className="bz-label block mb-1">
                Username
              </label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className="bz-input"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="bz-label block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showUserPassword ? 'text' : 'password'}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="bz-input pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
                  aria-label={showUserPassword ? 'Hide password' : 'Show password'}
                >
                  {showUserPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.85 2.9-5.03 5.2-6.4" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53a3.5 3.5 0 0 0 4.95 4.95" />
                      <path d="M14.47 14.47 9.53 9.53" />
                      <path d="M21 12c-.53 1.5-1.42 2.86-2.57 4" />
                      <path d="M12 4c3.73 0 7 2.01 9 5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="bz-label block mb-1">
                Role
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="bz-select"
              >
                <option value="presenter">Presenter</option>
                <option value="controller">Controller</option>
                <option value="team_owner">Team Owner</option>
              </select>
            </div>
            {userForm.role === 'team_owner' && (
              <div>
                <label className="bz-label block mb-1">
                  Team
                </label>
                <select
                  value={userForm.teamId}
                  onChange={(e) => setUserForm({ ...userForm, teamId: e.target.value })}
                  className="bz-select"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showTeamModal}
          title="Create Team"
          onClose={() => setShowTeamModal(false)}
          onConfirm={handleCreateTeam}
          confirmText="Create"
        >
          <input
            type="text"
            value={teamForm.name}
            onChange={(e) => setTeamForm({ name: e.target.value })}
            placeholder="Enter team name"
            className="bz-input"
          />
        </Modal>

        <Modal
          isOpen={showPlayerModal}
          title="Create Player"
          onClose={() => setShowPlayerModal(false)}
          onConfirm={handleCreatePlayer}
          confirmText="Create"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={playerForm.name}
              onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
              placeholder="Player name"
              className="bz-input"
            />
            <input
              type="text"
              value={playerForm.role}
              onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}
              placeholder="Player role"
              className="bz-input"
            />
            <input
              type="number"
              value={playerForm.basePrice}
              onChange={(e) => setPlayerForm({ ...playerForm, basePrice: e.target.value })}
              placeholder="Base price"
              className="bz-input"
            />
            <input
              type="number"
              value={playerForm.batch}
              onChange={(e) => setPlayerForm({ ...playerForm, batch: e.target.value })}
              placeholder="Batch number"
              className="bz-input"
            />
            <input
              type="url"
              value={playerForm.imageUrl}
              onChange={(e) => setPlayerForm({ ...playerForm, imageUrl: e.target.value })}
              placeholder="Image URL (optional)"
              className="bz-input"
            />
          </div>
        </Modal>

        <Modal
          isOpen={showResetAuctionModal}
          title="Reset Auction"
          onClose={() => setShowResetAuctionModal(false)}
          onConfirm={handleResetAuction}
          confirmText="Reset Everything"
          isDangerous
        >
          <div className="space-y-3">
            <p className="text-textPrimary">
              This will reset the full auction state.
            </p>
            <ul className="list-disc list-inside text-textSecondary text-sm space-y-1">
              <li>All players will be set to unsold</li>
              <li>All team points will be restored to 10000</li>
              <li>Auction batch/index will reset to batch 1, first player</li>
              <li>Live auction will be stopped</li>
            </ul>
          </div>
        </Modal>

        <Modal
          isOpen={showTeamSquadModal}
          title="Team Squad"
          hideFooter
          onClose={() => {
            setShowTeamSquadModal(false);
            setSelectedTeamForSquad(null);
          }}
          confirmText="Close"
          onConfirm={() => {
            setShowTeamSquadModal(false);
            setSelectedTeamForSquad(null);
          }}
        >
          {selectedTeamForSquad ? (
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-smpanel">
                <p className="text-xs text-textSecondary">Selected Team</p>
                <p className="text-base sm:text-lg font-bold text-textPrimary break-words">{selectedTeamForSquad.name}</p>
              </div>

              <div className="p-4 bg-elevated border border-subtle rounded-smpanel">
                <p className="text-sm text-textSecondary mb-1">Team Budget</p>
                <p className="text-2xl font-bold text-success">${selectedTeamForSquad.points.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-textPrimary mb-3">Players ({players.filter((p) => p.team_id === selectedTeamForSquad.id).length})</h3>
                {players.filter((p) => p.team_id === selectedTeamForSquad.id).length > 0 ? (
                  <div className="space-y-2 max-h-[52vh] sm:max-h-96 overflow-y-auto pr-1">
                    {players
                      .filter((p) => p.team_id === selectedTeamForSquad.id)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((player) => (
                        <div key={player.id} className="p-3 border border-subtle bg-elevated rounded-smpanel">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <p className="font-semibold text-textPrimary">{player.name}</p>
                              <p className="text-xs text-textSecondary capitalize">{player.role}</p>
                              <p className="text-xs text-textMuted mt-1">{formatBatchLabel(player.batch_number)}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-bold text-gold">${player.sold_price?.toLocaleString() || 'N/A'}</p>
                              <p className="text-xs text-textMuted">sold price</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-textSecondary text-sm">No players acquired yet</p>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
