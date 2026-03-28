'use client';

import Image from 'next/image';
import React from 'react';
import { Team, Player } from '@/types';
import { Card } from '@/components/shared/Card';

interface EndingPageProps {
  teams: Team[];
  players: Player[];
  totalRaised: number;
}

export function EndingPage({ teams, players, totalRaised }: EndingPageProps) {
  const unsoldTeamIds = new Set(
    teams
      .filter((team) => team.name.trim().toLowerCase() === 'unsold')
      .map((team) => team.id)
  );

  const isPlayerUnsold = (player: Player) => !player.team_id || unsoldTeamIds.has(player.team_id);

  // Count unsold players
  const unsoldPlayers = players.filter(isPlayerUnsold);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 pt-6 sm:pt-12">
          <div className="mb-6 flex justify-center">
            <div className="auction-logo-stage">
              <div className="auction-logo-ring" />
              <div className="auction-logo-core">
                <Image src="/icon.png" alt="BidZen" width={80} height={80} priority />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gold mb-2">
            Auction Complete
          </h1>
          <p className="text-lg sm:text-xl text-textSecondary font-light tracking-wide">
            Thank you for an incredible auction!
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Card className="text-center p-6 sm:p-8">
            <p className="bz-sub mb-2">Total Players Sold</p>
            <p className="text-4xl sm:text-5xl font-display font-bold text-primary">
              {players.filter((p) => !isPlayerUnsold(p)).length}
            </p>
            <p className="text-xs sm:text-sm text-textSecondary mt-2">
              out of {players.length} total
            </p>
          </Card>

          <Card className="text-center p-6 sm:p-8">
            <p className="bz-sub mb-2">Amount Raised</p>
            <p className="text-4xl sm:text-5xl font-display font-bold text-success">
              ${totalRaised.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-textSecondary mt-2">
              {players.length > 0
                ? `Avg: $${Math.round(totalRaised / Math.max(1, players.filter((p) => !isPlayerUnsold(p)).length)).toLocaleString()}`
                : 'No sales'}
            </p>
          </Card>

          <Card className="text-center p-6 sm:p-8">
            <p className="bz-sub mb-2">Unsold</p>
            <p className="text-4xl sm:text-5xl font-display font-bold text-warning">
              {unsoldPlayers.length}
            </p>
            <p className="text-xs sm:text-sm text-textSecondary mt-2">
              {unsoldPlayers.length === 0
                ? 'All players acquired!'
                : `${((unsoldPlayers.length / players.length) * 100).toFixed(1)}% unsold`}
            </p>
          </Card>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8 sm:py-12 mb-4">
          <p className="text-textSecondary text-base sm:text-lg mb-3">
            Great effort from all teams!
          </p>
          <p className="text-textMuted text-xs sm:text-sm uppercase tracking-widest">
            Thank you for participating in the BidZen Auction
          </p>
        </div>
      </div>
    </div>
  );
}
