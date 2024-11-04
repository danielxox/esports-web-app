import { db } from "~/server/db";
import { sql } from "drizzle-orm";
import {
  playerGameStats,
  games,
  teamObjectives,
  bans,
  champions,
  teams,
  tournaments,
  players,
} from "~/server/db/schema";

export interface Game {
  platformGameId: string;
  tournamentId: string | null;
  gameDuration: number;
  winnerSide: number;
  gameDate: string;
  blueTeam: string;
  redTeam: string;
  tournament: string | null;
}

export interface Player {
  platformGameId: string;
  summonerName: string;
  teamTag: string | null;
  teamName: string | null;
  championName: string | null;
  championImage: string | null;
  side: number;
  role: string | null;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  killParticipation: number;
  damagePerMinute: number;
  damageShare: number;
  visionScore: number;
  csPerMinute: number;
  goldPerMinute: number;
}

export interface Objective {
  platformGameId: string;
  teamTag: string;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
}

export interface Ban {
  platformGameId: string;
  teamTag: string;
  championName: string | null;
  pickTurn: number;
  teamName: string | null;
  championImage: string | null;
  side: number;
}

export async function getRecentGames(limit = 10): Promise<Game[]> {
  try {
    return await db
      .select({
        platformGameId: games.platformGameId,
        tournamentId: games.tournamentId,
        gameDuration: games.gameDuration,
        winnerSide: games.winnerSide,
        blueTeam: sql<string>`COALESCE(${teams.teamName}, '')`,
        redTeam: sql<string>`(SELECT team_name FROM teams WHERE team_tag = (SELECT team_tag FROM player_game_stats WHERE platform_game_id = ${games.platformGameId} AND side = 200 LIMIT 1))`,
        tournament: tournaments.tournamentName,
        gameDate: games.gameDate,
      })
      .from(games)
      .leftJoin(
        tournaments,
        sql`${tournaments.tournamentId} = ${games.tournamentId}`,
      )
      .leftJoin(
        playerGameStats,
        sql`${playerGameStats.platformGameId} = ${games.platformGameId}`,
      )
      .leftJoin(teams, sql`${teams.teamTag} = ${playerGameStats.teamTag}`)
      .where(sql`${playerGameStats.side} = 100`)
      .groupBy(games.platformGameId, tournaments.tournamentName, teams.teamName)
      .orderBy(sql`${games.gameDate} DESC`)
      .limit(limit);
  } catch (error) {
    console.error("Failed to get recent games:", error);
    throw new Error("Failed to get recent games");
  }
}

export async function getGameDetails(
  platformGameId: string,
): Promise<[Player[], Objective[], Ban[]]> {
  try {
    const playerStatsQuery = db
      .select({
        platformGameId: playerGameStats.platformGameId,
        summonerName: playerGameStats.summonerName,
        teamTag: playerGameStats.teamTag,
        teamName: teams.teamName,
        championName: playerGameStats.championName,
        championImage: champions.imageUrl,
        side: playerGameStats.side,
        role: players.role,
        kills: playerGameStats.kills,
        deaths: playerGameStats.deaths,
        assists: playerGameStats.assists,
        kda: playerGameStats.kda,
        killParticipation: playerGameStats.killParticipation,
        damagePerMinute: playerGameStats.damagePerMinute,
        damageShare: playerGameStats.damageShare,
        visionScore: playerGameStats.visionScore,
        csPerMinute: playerGameStats.csPerMinute,
        goldPerMinute: playerGameStats.goldPerMinute,
      })
      .from(playerGameStats)
      .leftJoin(teams, sql`${teams.teamTag} = ${playerGameStats.teamTag}`)
      .leftJoin(
        champions,
        sql`${champions.championName} = ${playerGameStats.championName}`,
      )
      .leftJoin(
        players,
        sql`${players.summonerName} = ${playerGameStats.summonerName} AND ${players.teamTag} = ${playerGameStats.teamTag}`,
      )
      .where(sql`${playerGameStats.platformGameId} = ${platformGameId}`)
      .orderBy(playerGameStats.side);

    const objectivesQuery = db
      .select()
      .from(teamObjectives)
      .where(sql`${teamObjectives.platformGameId} = ${platformGameId}`);

    const bansQuery = db
      .select({
        platformGameId: bans.platformGameId,
        teamTag: bans.teamTag,
        championName: bans.championName,
        pickTurn: bans.pickTurn,
        teamName: teams.teamName,
        championImage: champions.imageUrl,
        side: sql<number>`CASE WHEN ${bans.teamTag} = (SELECT team_tag FROM player_game_stats WHERE platform_game_id = ${platformGameId} AND side = 100 LIMIT 1) THEN 100 ELSE 200 END`,
      })
      .from(bans)
      .leftJoin(teams, sql`${teams.teamTag} = ${bans.teamTag}`)
      .leftJoin(
        champions,
        sql`${champions.championName} = ${bans.championName}`,
      )
      .where(sql`${bans.platformGameId} = ${platformGameId}`)
      .orderBy(bans.pickTurn);

    const [playerStats, objectives, gameBans] = await Promise.all([
      playerStatsQuery,
      objectivesQuery,
      bansQuery,
    ]);

    return [playerStats, objectives, gameBans];
  } catch (error) {
    console.error("Failed to get game details:", error);
    throw new Error("Failed to get game details");
  }
}
