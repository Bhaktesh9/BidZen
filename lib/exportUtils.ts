import { Team, Player } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

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
 * Export a single team's players to PDF
 */
export const exportTeamToPDF = (team: Team, players: Player[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Team Squad Report', pageWidth / 2, 15, { align: 'center' });
  
  // Team Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Team: ${team.name}`, 15, 30);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 15, 37);
  doc.text(`Total Players: ${players.length}`, 15, 44);
  
  // Table
  const tableData = players.map((player) => [
    player.name,
    player.role,
    player.sold_price ? `$${player.sold_price.toLocaleString()}` : 'Not Sold',
  ]);

  (doc as any).autoTable({
    head: [['Player Name', 'Role', 'Purchased Price']],
    body: tableData,
    startY: 52,
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
  });

  doc.save(`${team.name}-Squad.pdf`);
};

/**
 * Export all teams to Excel
 */
export const exportAllTeamsToExcel = (teams: Team[], players: Player[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['All Teams Export'],
    ['Export Date', new Date().toLocaleDateString()],
    ['Total Teams', teams.length],
    [],
    ['Team Name', 'Players', 'Total Points'],
    ...teams.map((team) => [
      team.name,
      players.filter((p) => p.team_id === team.id).length,
      team.points,
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Detailed sheet with all players
  const detailedData = [
    ['Team Name', 'Player Name', 'Role', 'Purchased Price'],
    ...players
      .sort((a, b) => {
        const teamA = teams.find((t) => t.id === a.team_id);
        const teamB = teams.find((t) => t.id === b.team_id);
        return (teamA?.name || '').localeCompare(teamB?.name || '');
      })
      .map((player) => {
        const team = teams.find((t) => t.id === player.team_id);
        return [
          team?.name || 'Not Assigned',
          player.name,
          player.role,
          player.sold_price ? `$${player.sold_price.toLocaleString()}` : 'Not Sold',
        ];
      }),
  ];

  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  detailedSheet['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'All Players');

  XLSX.writeFile(workbook, `All-Teams-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export all teams to PDF
 */
export const exportAllTeamsToPDF = (teams: Team[], players: Player[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('All Teams Report', pageWidth / 2, 15, { align: 'center' });
  
  // Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 15, 30);
  doc.text(`Total Teams: ${teams.length}`, 15, 37);
  
  // Summary table
  const summaryData = teams.map((team) => [
    team.name,
    players.filter((p) => p.team_id === team.id).length.toString(),
    `$${team.points.toLocaleString()}`,
  ]);

  (doc as any).autoTable({
    head: [['Team Name', 'Players', 'Remaining Points']],
    body: summaryData,
    startY: 45,
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
  });

  let yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    yPosition = 15;
  }

  // Detailed players section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Team Members', 15, yPosition);
  
  const sortedPlayers = players.sort((a, b) => {
    const teamA = teams.find((t) => t.id === a.team_id);
    const teamB = teams.find((t) => t.id === b.team_id);
    return (teamA?.name || '').localeCompare(teamB?.name || '');
  });

  const playerTableData = sortedPlayers.map((player) => {
    const team = teams.find((t) => t.id === player.team_id);
    return [
      team?.name || 'Not Assigned',
      player.name,
      player.role,
      player.sold_price ? `$${player.sold_price.toLocaleString()}` : 'Not Sold',
    ];
  });

  (doc as any).autoTable({
    head: [['Team', 'Player Name', 'Role', 'Purchased Price']],
    body: playerTableData,
    startY: yPosition + 5,
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
  });

  doc.save(`All-Teams-${new Date().toISOString().split('T')[0]}.pdf`);
};
