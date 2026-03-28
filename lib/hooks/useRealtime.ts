'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuctionState, Player, Team } from '@/types';

/**
 * Generic hook for real-time data updates
 */
export function useRealtimeData<T>(
  table: string,
  onUpdate?: (data: T[]) => void,
  dependencies: any[] = [],
  pollIntervalMs = 2500
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const fetchData = useCallback(async (showLoader = false) => {
    const shouldShowLoading = showLoader || isFirstLoadRef.current;
    try {
      if (shouldShowLoading) {
        setIsLoading(true);
      }
      const { data: result, error: err } = await supabase.from(table).select('*');
      if (err) throw err;
      const nextData = (result || []) as T[];
      setData((prevData) => {
        if (JSON.stringify(prevData) === JSON.stringify(nextData)) {
          return prevData;
        }
        return nextData;
      });
      onUpdate?.(nextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
      isFirstLoadRef.current = false;
    }
  }, [table, onUpdate]);

  const dependencySignature = JSON.stringify(dependencies);

  useEffect(() => {
    fetchData(true);

    // Subscribe to real-time changes
    const channel: RealtimeChannel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        () => {
          fetchData(false);
        }
      )
      .subscribe();

    const pollTimer = setInterval(() => {
      fetchData(false);
    }, pollIntervalMs);

    return () => {
      clearInterval(pollTimer);
      channel.unsubscribe();
    };
  }, [table, fetchData, pollIntervalMs, dependencySignature]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook for real-time team updates
 */
export function useTeams() {
  return useRealtimeData<Team>('teams');
}

/**
 * Hook for real-time auction state updates
 */
export function useAuctionState() {
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const fetchAuctionState = useCallback(async (showLoader = false) => {
    const shouldShowLoading = showLoader || isFirstLoadRef.current;
    try {
      if (shouldShowLoading) {
        setIsLoading(true);
      }
      const { data, error: err } = await supabase
        .from('auction_state')
        .select('*')
        .single();
      if (err) throw err;
      setAuctionState((previous) => {
        if (
          previous &&
          previous.current_batch === data.current_batch &&
          previous.current_player_index === data.current_player_index &&
          previous.auction_started === data.auction_started &&
          previous.updated_at === data.updated_at
        ) {
          return previous;
        }
        return data;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching auction state');
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
      isFirstLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAuctionState(true);

    const channel = supabase
      .channel('public:auction_state')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_state',
        },
        () => {
          fetchAuctionState(false);
        }
      )
      .subscribe();

    const pollTimer = setInterval(() => {
      fetchAuctionState(false);
    }, 3000);

    return () => {
      clearInterval(pollTimer);
      channel.unsubscribe();
    };
  }, [fetchAuctionState]);

  return { auctionState, isLoading, error, refetch: fetchAuctionState };
}

/**
 * Hook for real-time players updates
 */
export function usePlayers(batchNumber?: number) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const fetchPlayers = useCallback(async (showLoader = false) => {
    const shouldShowLoading = showLoader || isFirstLoadRef.current;
    try {
      if (shouldShowLoading) {
        setIsLoading(true);
      }
      let query = supabase
        .from('players')
        .select('*')
        .order('batch_number', { ascending: true })
        .order('created_at', { ascending: true })
        // Tie-break with id so list ordering stays stable across realtime refreshes.
        .order('id', { ascending: true });
      if (batchNumber) {
        query = query.eq('batch_number', batchNumber);
      }
      const { data, error: err } = await query;
      if (err) throw err;
      const nextPlayers = (data || []) as Player[];
      setPlayers((previousPlayers) => {
        if (JSON.stringify(previousPlayers) === JSON.stringify(nextPlayers)) {
          return previousPlayers;
        }
        return nextPlayers;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching players');
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
      isFirstLoadRef.current = false;
    }
  }, [batchNumber]);

  useEffect(() => {
    fetchPlayers(true);

    const channel = supabase
      .channel('public:players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        () => {
          fetchPlayers(false);
        }
      )
      .subscribe();

    const pollTimer = setInterval(() => {
      fetchPlayers(false);
    }, 3000);

    return () => {
      clearInterval(pollTimer);
      channel.unsubscribe();
    };
  }, [fetchPlayers]);

  return { players, isLoading, error, refetch: fetchPlayers };
}
