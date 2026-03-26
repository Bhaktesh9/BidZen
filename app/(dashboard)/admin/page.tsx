'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRealtimeData } from '@/lib/hooks/useRealtime';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Navbar } from '@/components/shared/Navbar';
import { removeToken, getToken } from '@/lib/token';
import { User, Team, Player } from '@/types';

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useAuth();
  const { data: users, refetch: refetchUsers } = useRealtimeData<User>('users');
  const { data: teams, refetch: refetchTeams } = useRealtimeData<Team>('teams');
  const { data: players, refetch: refetchPlayers } = useRealtimeData<Player>('players');
  const [defaultError, setDefaultError] = useState<string | null>(null);
  const [defaultSuccess, setDefaultSuccess] = useState<string | null>(null);

  const tabParam = searchParams.get('tab');
  const activeTab: 'users' | 'teams' | 'players' =
    tabParam === 'teams' || tabParam === 'players' || tabParam === 'users'
      ? tabParam
      : 'users';

  useEffect(() => {
    if (!defaultError && !defaultSuccess) return;

    const timer = setTimeout(() => {
      setDefaultError(null);
      setDefaultSuccess(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [defaultError, defaultSuccess]);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'super_admin')) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!tabParam) {
      router.replace('/admin?tab=users');
    }
  }, [tabParam, router]);

  const getAuthToken = () => getToken() || '';

  const handleCreateUser = async (username: string, password: string, role: string, teamId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ username, password, role, team_id: teamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        setDefaultError(error.message || 'Failed to create user');
        setDefaultSuccess(null);
        return false;
      }

      setDefaultError(null);
      setDefaultSuccess('User created successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
      return true;
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error creating user');
      setDefaultSuccess(null);
      return false;
    }
  };

  const handleCreateTeam = async (name: string) => {
    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        setDefaultError('Failed to create team');
        setDefaultSuccess(null);
        return;
      }

      setDefaultError(null);
      setDefaultSuccess('Team created successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error creating team');
      setDefaultSuccess(null);
    }
  };

  const handleCreatePlayer = async (
    name: string,
    role: string,
    basePrice: number,
    batch: number,
    imageUrl?: string
  ) => {
    try {
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          name,
          role,
          base_price: basePrice,
          batch_number: batch,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        setDefaultError('Failed to create player');
        setDefaultSuccess(null);
        return;
      }

      setDefaultError(null);
      setDefaultSuccess('Player created successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error creating player');
      setDefaultSuccess(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        setDefaultError(error.message || 'Failed to delete user');
        setDefaultSuccess(null);
        return;
      }

      const data = await response.json();
      setDefaultError(null);
      setDefaultSuccess(data.message || 'User deleted successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error deleting user');
      setDefaultSuccess(null);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        setDefaultError(error.message || 'Failed to delete team');
        setDefaultSuccess(null);
        return;
      }

      const data = await response.json();
      setDefaultError(null);
      setDefaultSuccess(data.message || 'Team deleted successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error deleting team');
      setDefaultSuccess(null);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        setDefaultError('Failed to delete player');
        setDefaultSuccess(null);
        return;
      }

      setDefaultError(null);
      setDefaultSuccess('Player deleted successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error deleting player');
      setDefaultSuccess(null);
    }
  };

  const handleReassignPlayerTeam = async (playerId: string, teamId: string | null) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ team_id: teamId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setDefaultError(error?.message || 'Failed to update player team');
        setDefaultSuccess(null);
        return;
      }

      setDefaultError(null);
      setDefaultSuccess('Player team updated successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error updating player team');
      setDefaultSuccess(null);
    }
  };

  const handleResetAuction = async () => {
    try {
      const response = await fetch('/api/admin/auction/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setDefaultError(error?.message || 'Failed to reset auction');
        setDefaultSuccess(null);
        return;
      }

      setDefaultError(null);
      setDefaultSuccess('Auction reset successfully');
      await Promise.all([refetchUsers(), refetchTeams(), refetchPlayers()]);
      router.refresh();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error resetting auction');
      setDefaultSuccess(null);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" message="Loading admin dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <AdminDashboard
        activeTab={activeTab}
        users={users}
        teams={teams}
        players={players}
        onCreateUser={handleCreateUser}
        onCreateTeam={handleCreateTeam}
        onCreatePlayer={handleCreatePlayer}
        onDeleteUser={handleDeleteUser}
        onDeleteTeam={handleDeleteTeam}
        onDeletePlayer={handleDeletePlayer}
        onReassignPlayerTeam={handleReassignPlayerTeam}
        onResetAuction={handleResetAuction}
        isLoading={userLoading}
        error={defaultError}
        success={defaultSuccess}
      />
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" message="Loading admin dashboard..." />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
