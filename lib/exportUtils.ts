import { Team, Player } from '@/types';
import * as XLSX from 'xlsx';

/**
 * Export a single team's players to Excel
 */
export const exportTeamToExcel = (team: Team, players: Player[]) => {
  const workbook = XLSX.utils.book_new();
  
  const sheetData = [
    ['Team Name', team.name],
    ['Export Date', new Date().toLocaleDateString()],
    [],
    ['Player Name', 'Role', 'Purchased Price'],
    ...players.map((player) => [
      player.name,
      player.role,
      player.sold_price ? `$${player.sold_price.toLocaleString()}` : 'Not Sold',
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Squad');
  XLSX.writeFile(workbook, `${team.name}-Squad.xlsx`);
};

/**
 * Export all teams to Excel with one sheet per team
 */
export const exportAllTeamsToExcel = (teams: Team[], players: Player[]) => {
  const workbook = XLSX.utils.book_new();
  
  teams.forEach((team) => {
    const teamPlayers = players.filter((p) => p.team_id === team.id);
    
    const sheetData = [
      ['Team Name', team.name],
      ['Export Date', new Date().toLocaleDateString()],
      ['Total Players', teamPlayers.length],
      [],
      ['Player Name', 'Role', 'Purchased Price'],
      ...teamPlayers.map((player) => [
        player.name,
        player.role,
        player.sold_price ? `$${player.sold_price.toLocaleString()}` : 'Not Sold',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    
    // Sanitize sheet name (max 31 chars, remove invalid characters)
    const sheetName = team.name.substring(0, 31).replace(/[\\/?*\[\]]/g, '');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  XLSX.writeFile(workbook, `All-Teams-${new Date().toISOString().split('T')[0]}.xlsx`);
};
