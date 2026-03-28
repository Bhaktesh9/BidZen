'use client';

import Image from 'next/image';
import React from 'react';
import { Player, Team } from '@/types';
import { Card } from '@/components/shared/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface TeamOwnerDashboardProps {
  team: Team | null;
  purchasedPlayers: Player[];
  isLoading: boolean;
  error: string | null;
}

export function TeamOwnerDashboard({
  team,
  purchasedPlayers,
  isLoading,
  error,
}: TeamOwnerDashboardProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Loading team data..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-textPrimary">Team not found</h1>
          <p className="text-textSecondary mt-2">Please contact admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="bg-danger/15 border border-danger/40 text-danger p-4 rounded-smpanel mb-6 font-mono text-xs tracking-wide">
            {error}
          </div>
        )}

        <Card className="mb-4 sm:mb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-[radial-gradient(circle,rgba(72,187,120,0.14)_0%,transparent_65%)] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="bz-sub mb-1 sm:mb-2">YOUR TEAM</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-textPrimary break-words">{team.name}</h1>
              <p className="text-textSecondary text-xs sm:text-sm mt-1">Team Owner Dashboard</p>
            </div>
            <div className="text-left md:text-right">
              <p className="bz-sub mb-1">Remaining Budget</p>
              <p className="text-3xl sm:text-4xl font-display font-extrabold text-success">
                ${team.points.toLocaleString()}
              </p>
              <p className="text-textMuted text-xs font-mono">points available</p>
            </div>
          </div>
        </Card>

        {/* Points Overview */}
        <Card className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-elevated border border-subtle rounded-smpanel">
              <p className="bz-sub">Remaining Points</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-success mt-2">
                ${team.points.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-elevated border border-subtle rounded-smpanel">
              <p className="bz-sub">Players Purchased</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-primary mt-2">
                {purchasedPlayers.length}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-elevated border border-subtle rounded-smpanel">
              <p className="bz-sub">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-sold mt-2">
                ${(10000 - team.points).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Purchased Players */}
        <Card title="Your Squad">
          {purchasedPlayers.length === 0 ? (
            <p className="text-textSecondary text-center py-8">
              No players purchased yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {purchasedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="border border-subtle bg-elevated rounded-smpanel overflow-hidden min-h-[200px] sm:min-h-[220px]"
                >
                  {player.image_url ? (
                    <div className="relative w-full h-36 sm:h-44 bg-card border-b border-subtle">
                      <Image
                        src={player.image_url}
                        alt={player.name}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-card border-b border-subtle">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/40 bg-elevated flex items-center justify-center font-display font-bold text-primary">
                        {getInitials(player.name)}
                      </div>
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-textPrimary text-sm sm:text-base break-words">{player.name}</h3>
                    <p className="text-xs sm:text-sm text-textSecondary capitalize">{player.role}</p>
                    <div className="mt-2 pt-2 border-t border-subtle">
                      <p className="bz-sub">Purchased for</p>
                      <p className="text-base sm:text-lg font-display font-bold text-gold">
                        ${player.sold_price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
