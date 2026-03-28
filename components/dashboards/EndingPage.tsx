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

  // Calculate team statistics
  const teamStats = teams
    .filter((team) => team.name.trim().toLowerCase() !== 'unsold')
    .map((team) => {
    const teamPlayers = players.filter((p) => p.team_id === team.id);
    const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.sold_price || 0), 0);
    const playersAcquired = teamPlayers.length;
    const remainingBudget = team.points;

    return {
      team,
      playersAcquired,
      totalSpent,
      remainingBudget,
      avgPrice: playersAcquired > 0 ? Math.round(totalSpent / playersAcquired) : 0,
    };
  });

  // Sort by players acquired (descending)
  const rankedTeams = [...teamStats].sort(
    (a, b) => b.playersAcquired - a.playersAcquired
  );

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

        {/* Team Rankings */}
        <Card title="Final Rankings" className="mb-8 sm:mb-12">
          <div className="space-y-3">
            {rankedTeams.map((stat, index) => (
              <div
                key={stat.team.id}
                className="flex items-center gap-3 sm:gap-4 p-4 border border-subtle bg-elevated rounded-smpanel hover:border-primary/50 transition-colors"
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gold to-primary flex items-center justify-center">
                  <span className="font-display font-bold text-base sm:text-lg text-textPrimary">
                    #{index + 1}
                  </span>
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-textPrimary truncate">
                    {stat.team.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-textSecondary">
                    {stat.playersAcquired} {stat.playersAcquired === 1 ? 'player' : 'players'} • ${stat.totalSpent.toLocaleString()} spent
                  </p>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm sm:text-base font-bold text-primary">
                    ${stat.avgPrice.toLocaleString()}
                  </div>
                  <p className="text-xs text-textSecondary">avg price</p>
                </div>

                {/* Budget Remaining */}
                <div
                  className={`flex-shrink-0 w-16 sm:w-20 px-3 py-2 rounded-smpanel text-center border ${
                    stat.remainingBudget > 0
                      ? 'border-subtle bg-elevated'
                      : 'border-success/40 bg-success/10'
                  }`}
                >
                  <div className="text-xs text-textSecondary">Budget Left</div>
                  <div
                    className={`text-sm font-bold ${
                      stat.remainingBudget > 0 ? 'text-warning' : 'text-success'
                    }`}
                  >
                    ${stat.remainingBudget.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Unsold Players */}
        {unsoldPlayers.length > 0 && (
          <Card title="Unsold Players" className="mb-8 sm:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unsoldPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-3 sm:p-4 border border-warning/40 bg-warning/5 rounded-smpanel"
                >
                  <p className="text-sm sm:text-base font-bold text-textPrimary">{player.name}</p>
                  <p className="text-xs text-textSecondary capitalize mt-1">{player.role}</p>
                  <p className="text-xs text-warning mt-2">
                    Starting: ${player.base_price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

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
