'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuctionState, usePlayers, useTeams } from '@/lib/hooks/useRealtime';
import { PresenterDashboard } from '@/components/dashboards/PresenterDashboard';
import { EndingPage } from '@/components/dashboards/EndingPage';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Navbar } from '@/components/shared/Navbar';
import { removeToken, getToken } from '@/lib/token';
import { Player, Team } from '@/types';

type PresenterAnnouncement = {
  type: 'sold' | 'batch' | 'ended';
  title: string;
  detail: string;
};

export default function PresenterPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuth();
  const { auctionState } = useAuctionState();
  const { players } = usePlayers();
  const { data: teams } = useTeams();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [defaultError, setDefaultError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<PresenterAnnouncement | null>(null);
  const [currentPlayerKey, setCurrentPlayerKey] = useState<string>('none');
  const currentPlayerIdRef = useRef<string | null>(null);
  const pendingSoldPlayerIdRef = useRef<string | null>(null);
  const lastAnnouncedSoldIdRef = useRef<string | null>(null);
  const previousAuctionRef = useRef<{
    batch: number;
    index: number;
    started: boolean;
  } | null>(null);
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCurrentPlayer = useCallback(async () => {
    try {
      const response = await fetch('/api/auction/next-player', {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
        },
      });

      if (response.status === 404) {
        if (currentPlayerIdRef.current) {
          pendingSoldPlayerIdRef.current = currentPlayerIdRef.current;
        }
        currentPlayerIdRef.current = null;
        setCurrentPlayer(null);
        setCurrentPlayerKey('none');
        return;
      }

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      const nextPlayer = result?.player as Player | undefined;

      if (!nextPlayer) {
        return;
      }

      if (currentPlayerIdRef.current && currentPlayerIdRef.current !== nextPlayer.id) {
        pendingSoldPlayerIdRef.current = currentPlayerIdRef.current;
      }

      currentPlayerIdRef.current = nextPlayer.id;
      setCurrentPlayer(nextPlayer);
      setCurrentPlayerKey(`${nextPlayer.id}:${result?.batchNumber || 0}:api`);
    } catch {
      // silent fallback
    }
  }, []);

  const showAnnouncement = (nextAnnouncement: PresenterAnnouncement, durationMs: number) => {
    setAnnouncement(nextAnnouncement);
    if (announcementTimerRef.current) {
      clearTimeout(announcementTimerRef.current);
    }
    announcementTimerRef.current = setTimeout(() => {
      setAnnouncement(null);
      announcementTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'presenter')) {
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

  useEffect(() => {
    if (!auctionState) return;

    const previousAuction = previousAuctionRef.current;
    if (!previousAuction) {
      previousAuctionRef.current = {
        batch: auctionState.current_batch,
        index: auctionState.current_player_index,
        started: auctionState.auction_started,
      };
      return;
    }

    const batchChanged = auctionState.current_batch > previousAuction.batch;
    const playerAdvanced =
      auctionState.current_batch !== previousAuction.batch ||
      auctionState.current_player_index !== previousAuction.index;
    const auctionEnded = previousAuction.started && !auctionState.auction_started;

    const pendingSoldPlayerId = pendingSoldPlayerIdRef.current;
    const soldPlayer = pendingSoldPlayerId
      ? players.find((player) => player.id === pendingSoldPlayerId && !!player.team_id && !!player.sold_price)
      : null;

    if (soldPlayer && soldPlayer.id !== lastAnnouncedSoldIdRef.current) {
      const soldTeam = (teams as Team[]).find((team) => team.id === soldPlayer.team_id);
      showAnnouncement(
        {
          type: 'sold',
          title: 'Player Sold',
          detail: `${soldPlayer.name} sold to ${soldTeam?.name || 'team'} for $${soldPlayer.sold_price?.toLocaleString()}`,
        },
        10000
      );
      lastAnnouncedSoldIdRef.current = soldPlayer.id;
      pendingSoldPlayerIdRef.current = null;
    } else if (auctionEnded) {
      showAnnouncement(
        {
          type: 'ended',
          title: 'Auction Ended',
          detail: 'All players have been processed. Great auction everyone.',
        },
        8000
      );
    } else if (batchChanged) {
      const isUnsoldBatch = auctionState.current_batch === 10;
      showAnnouncement(
        {
          type: 'batch',
          title: isUnsoldBatch ? 'Unsold Batch Incoming' : 'Next Batch Incoming',
          detail: isUnsoldBatch
            ? 'Unsold Batch is now live'
            : `Batch ${String(auctionState.current_batch).padStart(2, '0')} is now live`,
        },
        5000
      );
    } else if (playerAdvanced && announcement?.type !== 'sold') {
      setAnnouncement(null);
    }

    previousAuctionRef.current = {
      batch: auctionState.current_batch,
      index: auctionState.current_player_index,
      started: auctionState.auction_started,
    };
  }, [auctionState, players, teams, announcement?.type]);

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) {
        clearTimeout(announcementTimerRef.current);
      }
    };
  }, []);

  const handleStartAuction = async () => {
    try {
      const response = await fetch('/api/auction/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
        },
      });

      if (!response.ok) {
        setDefaultError('Failed to start auction');
        return;
      }
    } catch (error) {
      setDefaultError(error instanceof Error ? error.message : 'Error starting auction');
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" message="Loading presenter dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate remaining players
  const playersRemaining = players.filter((p) => !p.team_id && p.batch_number !== 7).length;
  const playersInBatch = players.filter(
    (p) => p.batch_number === auctionState?.current_batch && p.batch_number !== 7 && !p.team_id
  ).length;

  // Find low points teams
  const lowPointsTeams = (teams as Team[]).filter(
    (t) => t.points < 1000 && t.name.trim().toLowerCase() !== 'unsold'
  );

  // Calculate total raised
  const totalRaised = players.reduce((sum, p) => sum + (p.sold_price || 0), 0);

  // Check if auction is complete
  const isAuctionComplete = !currentPlayer && !auctionState?.auction_started;

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {isAuctionComplete ? (
        <EndingPage teams={teams as Team[]} players={players} totalRaised={totalRaised} />
      ) : (
        <PresenterDashboard
          currentPlayer={currentPlayer}
          currentPlayerKey={currentPlayerKey}
          announcement={announcement}
          auctionStarted={auctionState?.auction_started || false}
          playersRemaining={playersRemaining}
          playersInBatch={playersInBatch}
          currentBatch={auctionState?.current_batch || 1}
          lowPointsTeams={lowPointsTeams}
          onStartAuction={handleStartAuction}
          isLoading={userLoading}
          error={defaultError}
        />
      )}
    </>
  );
}
