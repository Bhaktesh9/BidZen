'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuctionState, usePlayers, useTeams } from '@/lib/hooks/useRealtime';
import { ControllerDashboard } from '@/components/dashboards/ControllerDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Navbar } from '@/components/shared/Navbar';
import { removeToken, getToken } from '@/lib/token';
import { Player, Team } from '@/types';

export default function ControllerPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuth();
  const { auctionState, refetch: refetchAuctionState } = useAuctionState();
  const { players, refetch: refetchPlayers } = usePlayers();
  const { data: teams, refetch: refetchTeams } = useTeams();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [defaultError, setDefaultError] = useState<string | null>(null);

  const fetchCurrentPlayer = useCallback(async () => {
    try {
      const response = await fetch('/api/auction/next-player', {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
        },
      });

      if (response.status === 404) {
        setCurrentPlayer(null);
        return;
      }

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      setCurrentPlayer(result?.player || null);
    } catch {
      // silent: realtime and polling hooks still provide fallback
    }
  }, []);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'controller')) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    fetchCurrentPlayer();

    const timer = setInterval(() => {
      fetchCurrentPlayer();
    }, 2000);

    return () => clearInterval(timer);
  }, [fetchCurrentPlayer]);

  const handleSubmitBid = async (price: number, teamId: string) => {
    try {
      const response = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken() || ''}`,
        },
        body: JSON.stringify({
          final_bid_price: price,
          winning_team_id: teamId,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setDefaultError(result?.message || 'Failed to submit bid');
        throw new Error(result?.message || 'Failed to submit bid');
      }

      setDefaultError(null);
      await Promise.all([refetchAuctionState(), refetchPlayers(), refetchTeams()]);
      await fetchCurrentPlayer();
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error submitting bid');
      throw error;
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" message="Loading controller dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const playersRemaining = players.filter((p) => !p.team_id && p.batch_number !== 7).length;
  const playersInBatch = players.filter(
    (p) => p.batch_number === auctionState?.current_batch && p.batch_number !== 7 && !p.team_id
  ).length;

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <ControllerDashboard
        currentPlayer={currentPlayer}
        teams={teams as Team[]}
        playersRemaining={playersRemaining}
        playersInBatch={playersInBatch}
        currentBatch={auctionState?.current_batch || 1}
        onSubmitBid={handleSubmitBid}
        isLoading={userLoading}
        error={defaultError}
      />
    </>
  );
}
