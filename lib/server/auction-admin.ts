import { supabaseAdmin } from '@/lib/supabase';

const TEAM_INITIAL_POINTS = 10000;

export async function recalculateTeamPoints() {
  const { data: teams, error: teamsError } = await supabaseAdmin
    .from('teams')
    .select('id');

  if (teamsError) throw teamsError;

  const { data: assignedPlayers, error: playersError } = await supabaseAdmin
    .from('players')
    .select('team_id, sold_price, base_price')
    .not('team_id', 'is', null);

  if (playersError) throw playersError;

  const spentByTeam = new Map<string, number>();

  for (const player of assignedPlayers || []) {
    if (!player.team_id) continue;
    const spend = (player.sold_price ?? player.base_price ?? 0) as number;
    const current = spentByTeam.get(player.team_id) || 0;
    spentByTeam.set(player.team_id, current + spend);
  }

  await Promise.all(
    (teams || []).map(async (team) => {
      const spent = spentByTeam.get(team.id) || 0;
      const nextPoints = Math.max(0, TEAM_INITIAL_POINTS - spent);

      const { error: updateError } = await supabaseAdmin
        .from('teams')
        .update({ points: nextPoints })
        .eq('id', team.id);

      if (updateError) throw updateError;
    })
  );
}

export { TEAM_INITIAL_POINTS };
