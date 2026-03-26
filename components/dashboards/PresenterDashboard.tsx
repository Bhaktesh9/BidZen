'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Player } from '@/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface PresenterDashboardProps {
  currentPlayer: Player | null;
  currentPlayerKey: string;
  announcement: {
    type: 'sold' | 'batch' | 'ended';
    title: string;
    detail: string;
  } | null;
  auctionStarted: boolean;
  playersRemaining: number;
  playersInBatch: number;
  currentBatch: number;
  lowPointsTeams: any[];
  onStartAuction: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function PresenterDashboard({
  currentPlayer,
  currentPlayerKey,
  announcement,
  auctionStarted,
  playersRemaining,
  playersInBatch,
  currentBatch,
  lowPointsTeams,
  onStartAuction,
  isLoading,
  error,
}: PresenterDashboardProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAuction = async () => {
    setIsStarting(true);
    try {
      await onStartAuction();
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Loading auction data..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-base p-4 overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {announcement && (
          <div className="fixed inset-0 z-40 pointer-events-none flex items-start justify-center pt-20 px-4">
            <div
              className={`w-full max-w-2xl bz-panel p-5 border animate-fade-in shadow-glow ${
                announcement.type === 'sold'
                  ? 'border-success/50 bg-success/10'
                  : announcement.type === 'batch'
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-sold/50 bg-sold/10'
              }`}
            >
              <p className="bz-sub mb-1">
                {announcement.type === 'sold'
                  ? 'LIVE RESULT'
                  : announcement.type === 'batch'
                  ? 'ROUND TRANSITION'
                  : 'FINAL STATUS'}
              </p>
              <h3 className="text-2xl font-display font-bold text-textPrimary">{announcement.title}</h3>
              <p className="text-textSecondary mt-1">{announcement.detail}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-danger/15 border border-danger/40 text-danger p-4 rounded-smpanel mb-6 font-mono text-xs tracking-wide">
            {error}
          </div>
        )}

        <div className="mb-4">
          <h1 className="text-4xl font-display font-bold text-textPrimary">Live Auction Stage</h1>
          <p className="bz-sub mt-1">BATCH {String(currentBatch).padStart(2, '0')} — LIVE</p>
        </div>

        {!auctionStarted ? (
          <Card className="mb-6 text-center py-12">
            <div className="auction-logo-stage">
              <div className="auction-logo-ring" />
              <div className="auction-logo-core">
                <Image src="/icon.png" alt="BidZen" width={72} height={72} priority />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold mb-4 text-textPrimary">Ready to start?</h2>
            <p className="bz-sub mb-5">LIVE AUCTION ENGINE PRIMED</p>
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartAuction}
              isLoading={isStarting}
            >
              Start Auction
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
            <div className="lg:col-span-3 min-h-0">
              <Card className="h-full">
                {currentPlayer ? (
                  <div key={currentPlayerKey} className="h-full flex flex-col gap-4 min-h-0 animate-fade-in">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="bz-sub">Current Player</p>
                        <h3 className="text-3xl font-display font-extrabold text-textPrimary leading-tight">
                          {currentPlayer.name}
                        </h3>
                        <p className="text-textSecondary capitalize mt-1">{currentPlayer.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="bz-sub">Base Price</p>
                        <p className="text-4xl font-display font-extrabold text-gold leading-none">
                          ${currentPlayer.base_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex-1 min-h-[320px] bg-elevated border border-subtle rounded-smpanel p-3">
                      {currentPlayer.image_url ? (
                        <Image
                          src={currentPlayer.image_url}
                          alt={currentPlayer.name}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-contain rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-textMuted font-mono text-xs tracking-wider uppercase">
                          No Player Image
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-textSecondary">No player available</p>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2 min-h-0 flex flex-col gap-4">
              <Card title="Live Progress">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-elevated border border-subtle rounded-smpanel">
                    <p className="bz-sub">Batch</p>
                    <p className="text-3xl font-display font-bold text-primary leading-none">{String(currentBatch).padStart(2, '0')}</p>
                  </div>
                  <div className="p-3 bg-elevated border border-subtle rounded-smpanel">
                    <p className="bz-sub">Remaining In Batch</p>
                    <p className="text-3xl font-display font-bold text-primary leading-none">{playersInBatch}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-elevated border border-subtle rounded-smpanel">
                    <p className="bz-sub">Total Remaining</p>
                    <p className="text-3xl font-display font-bold text-sold leading-none">{playersRemaining}</p>
                  </div>
                </div>
              </Card>

              <Card className="flex-1 min-h-0 overflow-hidden" title="Team Budget Watch">
                {lowPointsTeams.length > 0 ? (
                  <ul className="space-y-2 max-h-full overflow-y-auto pr-1">
                    {lowPointsTeams.map((team) => (
                      <li
                        key={team.id}
                        className="flex items-center justify-between p-2.5 bg-warning/10 border border-warning/30 rounded-smpanel"
                      >
                        <span className="text-sm text-textPrimary">{team.name}</span>
                        <span className="font-mono text-xs text-warning font-semibold">${team.points}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full min-h-[140px] flex items-center justify-center text-sm text-textSecondary">
                    All teams are above 1000 points.
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
