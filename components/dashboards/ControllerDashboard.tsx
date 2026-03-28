'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Player, Team } from '@/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ControllerDashboardProps {
  currentPlayer: Player | null;
  teams: Team[];
  playersRemaining: number;
  playersInBatch: number;
  currentBatch: number;
  onSubmitBid: (price: number, teamId: string) => Promise<void>;
  onMarkUnsold: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ControllerDashboard({
  currentPlayer,
  teams,
  playersRemaining,
  playersInBatch,
  currentBatch,
  onSubmitBid,
  onMarkUnsold,
  isLoading,
  error,
}: ControllerDashboardProps) {
  const [bidPrice, setBidPrice] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingUnsold, setIsMarkingUnsold] = useState(false);
  const batchLabel = currentBatch === 10 ? 'UNSOLD BATCH' : `BATCH ${String(currentBatch).padStart(2, '0')}`;
  const currentPlayerTitle = currentBatch === 10
    ? 'Current Player - Unsold Batch'
    : `Current Player · Batch ${String(currentBatch).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidPrice || !selectedTeam) return;

    setIsSubmitting(true);
    try {
      await onSubmitBid(parseInt(bidPrice), selectedTeam);
      setBidPrice('');
      setSelectedTeam('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkUnsold = async () => {
    setIsMarkingUnsold(true);
    try {
      await onMarkUnsold();
    } finally {
      setIsMarkingUnsold(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Loading controller data..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto min-h-full flex flex-col pb-3">
        {error && (
          <div className="bg-danger/15 border border-danger/40 text-danger p-3 sm:p-4 rounded-smpanel mb-4 sm:mb-6 font-mono text-xs tracking-wide">
            {error}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-textPrimary mb-1">Bid Controller</h1>
        <p className="bz-sub mb-3 sm:mb-4">FAST ACTIONS — {batchLabel} IN PROGRESS</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="lg:col-span-3">
            <Card className="h-full" title={currentPlayerTitle}>
              {currentPlayer ? (
                <div className="h-full flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-elevated border border-subtle rounded-smpanel">
                      <p className="bz-sub">Remaining In Batch</p>
                      <p className="text-2xl font-display font-bold text-primary">{playersInBatch}</p>
                    </div>
                    <div className="p-3 bg-elevated border border-subtle rounded-smpanel">
                      <p className="bz-sub">Total Remaining</p>
                      <p className="text-2xl font-display font-bold text-sold">{playersRemaining}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-elevated border border-subtle rounded-smpanel flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="bz-sub">Player</p>
                      <h3 className="text-xl font-display font-bold text-textPrimary leading-tight">{currentPlayer.name}</h3>
                      <p className="text-textSecondary text-sm capitalize">{currentPlayer.role}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="bz-sub">Base Price</p>
                      <p className="text-2xl sm:text-3xl font-display font-extrabold text-gold leading-none">${currentPlayer.base_price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="relative flex-1 min-h-[220px] bg-elevated border border-subtle rounded-smpanel p-2">
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
                      <div className="w-full h-full flex items-center justify-center text-textMuted font-mono text-xs uppercase tracking-wider">
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

          <div className="lg:col-span-2 flex flex-col gap-3">
            <Card title="Submit Bid" className="shrink-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="bz-label block mb-2">Final Bid Price</label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="Enter bid price"
                    className="bz-input font-mono text-lg"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="bz-label block mb-2">Winning Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="bz-select"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} (${team.points})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!bidPrice || !selectedTeam || !currentPlayer}
                  className="w-full"
                >
                  Submit Bid
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  isLoading={isMarkingUnsold}
                  disabled={!currentPlayer}
                  onClick={handleMarkUnsold}
                  className="w-full"
                >
                  Mark as Unsold
                </Button>
              </form>
            </Card>

            <Card title="Team Money Left" className="lg:flex-1 min-h-[220px]">
              <div className="space-y-2 h-full max-h-64 lg:max-h-[320px] overflow-y-auto pr-1">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex justify-between items-center p-2.5 bg-elevated border border-subtle rounded-smpanel"
                  >
                    <span className="font-medium text-textPrimary text-sm">{team.name}</span>
                    <span className={`text-base font-bold ${
                      team.points < 1000 ? 'text-warning' : 'text-success'
                    }`}>
                      ${team.points.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
