// api/update.js — Déclenché toutes les heures par Vercel Cron
// Récupère matchs du jour, scores live, et statuts blessures
 
export default async function handler(req, res) {
  // Sécurité : seulement Vercel Cron ou appel manuel avec token
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
 
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
 
    // ── 1. Matchs du jour via l'API publique NHL ──
    const scheduleRes = await fetch(
      `https://api-web.nhle.com/v1/schedule/${dateStr}`
    );
    const scheduleData = await scheduleRes.json();
 
    const games = [];
    const gameWeek = scheduleData.gameWeek || [];
    for (const day of gameWeek) {
      if (day.date === dateStr) {
        for (const game of (day.games || [])) {
          games.push({
            id: game.id,
            status: game.gameState,         // LIVE, FUT, OFF, FINAL
            startTime: game.startTimeUTC,
            home: game.homeTeam?.abbrev,
            away: game.awayTeam?.abbrev,
            homeScore: game.homeTeam?.score ?? null,
            awayScore: game.awayTeam?.score ?? null,
            period: game.periodDescriptor?.number ?? null,
            clock: game.clock?.timeRemaining ?? null,
          });
        }
      }
    }
 
    // ── 2. Blessures / statuts joueurs (toutes équipes) ──
    const injuryRes = await fetch(
      'https://api-web.nhle.com/v1/injury-report'
    );
    const injuryData = injuryRes.ok ? await injuryRes.json() : {};
 
    const injuries = {};
    for (const player of (injuryData.playerList || [])) {
      const team = player.teamAbbrev;
      if (!injuries[team]) injuries[team] = [];
      injuries[team].push({
        name: `${player.firstName?.default} ${player.lastName?.default}`,
        status: player.injuryType || 'INJ',
        detail: player.injuryDescription || '',
      });
    }
 
    // ── 3. Scores live des matchs en cours ──
    const liveGames = games.filter(g => g.status === 'LIVE');
    const liveScores = {};
    await Promise.all(liveGames.map(async (g) => {
      try {
        const r = await fetch(`https://api-web.nhle.com/v1/gamecenter/${g.id}/landing`);
        const d = await r.json();
        liveScores[g.id] = {
          home: d.homeTeam?.score ?? 0,
          away: d.awayTeam?.score ?? 0,
          period: d.periodDescriptor?.number ?? 1,
          clock: d.clock?.timeRemaining ?? '20:00',
          situation: d.situation?.homeTeam?.situationCode ?? '5v5',
        };
      } catch (_) {}
    }));
 
    // ── 4. Réponse ──
    const payload = {
      updatedAt: new Date().toISOString(),
      date: dateStr,
      games,
      liveScores,
      injuries,
    };
 
    // Cache 55 minutes côté client
    res.setHeader('Cache-Control', 's-maxage=3300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(payload);
 
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ error: err.message });
  }
}
