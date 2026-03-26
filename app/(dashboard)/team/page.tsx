'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePlayers, useTeams } from '@/lib/hooks/useRealtime';
import { TeamOwnerDashboard } from '@/components/dashboards/TeamOwnerDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Navbar } from '@/components/shared/Navbar';
import { removeToken } from '@/lib/token';
import { Player, Team } from '@/types';

export default function TeamOwnerPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuth();
  const { players } = usePlayers();
  const { data: teams } = useTeams();
  const [team, setTeam] = useState<Team | null>(null);
  const [purchasedPlayers, setPurchasedPlayers] = useState<Player[]>([]);
  const [defaultError, setDefaultError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'team_owner')) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && teams.length > 0) {
      const userTeam = teams.find((t) => t.id === user.team_id);
      if (userTeam) {
        setTeam(userTeam);
      } else {
        setDefaultError('Team not found');
      }
    }
  }, [user, teams]);

  useEffect(() => {
    if (user && players.length > 0) {
      const teamPlayers = players.filter((p) => p.team_id === user.team_id);
      setPurchasedPlayers(teamPlayers);
    }
  }, [user, players]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" message="Loading team dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <TeamOwnerDashboard
        team={team}
        purchasedPlayers={purchasedPlayers}
        isLoading={userLoading}
        error={defaultError}
      />
    </>
  );
}
