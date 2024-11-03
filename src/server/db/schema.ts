import {
  pgTable,
  varchar,
  text,
  serial,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// Define tournaments table
export const tournaments = pgTable("tournaments", {
  tournamentId: varchar("tournament_id").primaryKey(),
  tournamentName: text("tournament_name"), // Ensure tournament names are not null
});

// Define teams table
export const teams = pgTable("teams", {
  teamTag: varchar("team_tag").primaryKey(),
  teamName: text("team_name"), // Ensure team names are not null
});

// Define players table
export const players = pgTable("players", {
  playerId: serial("player_id").primaryKey(),
  summonerName: text("summoner_name").unique(), // Unique and not null summoner names
  teamTag: varchar("team_tag").references(() => teams.teamTag), // Ensure teamTag is not null
});

// Define champions table
export const champions = pgTable("champions", {
  championName: text("champion_name").primaryKey(),
  imageUrl: text("image_url"), // Ensure image URL is not null
});

// Define games table
export const games = pgTable("games", {
  platformGameId: varchar("platform_game_id").primaryKey(),
  tournamentId: varchar("tournament_id").references(
    () => tournaments.tournamentId,
  ), // Ensure tournamentId is not null
  gameDuration: integer("game_duration"), // Ensure game duration is not null
  gameDate: timestamp("game_date"), // Ensure game date is not null
});

// Define player game stats table
export const playerGameStats = pgTable("player_game_stats", {
  id: serial("id").primaryKey(),
  platformGameId: varchar("platform_game_id").references(
    () => games.platformGameId,
  ), // Ensure platformGameId is not null
  playerId: integer("player_id").references(() => players.playerId), // Ensure playerId is not null
  championName: text("champion_name").references(() => champions.championName), // Ensure championName is not null
  side: integer("side"), // Ensure side is not null (1 for Blue, 2 for Red)
  role: text("role"), // Ensure role is not null
  win: boolean("win"), // Ensure win status is not null
  kills: integer("kills"), // Ensure kills is not null
  deaths: integer("deaths"), // Ensure deaths is not null
  assists: integer("assists"), // Ensure assists is not null
  kda: doublePrecision("kda"), // Ensure KDA is not null
  killParticipation: doublePrecision("kill_participation"), // Ensure kill participation is not null
  damagePerMinute: doublePrecision("damage_per_minute"), // Ensure damage per minute is not null
  damageShare: doublePrecision("damage_share"), // Ensure damage share is not null
  wardsPlacedPerMinute: doublePrecision("wards_placed_per_minute"), // Ensure wards placed per minute is not null
  wardsClearedPerMinute: doublePrecision("wards_cleared_per_minute"), // Ensure wards cleared per minute is not null
  controlWardsPurchased: integer("control_wards_purchased"), // Ensure control wards purchased is not null
  creepScore: integer("creep_score"), // Ensure creep score is not null
  creepScorePerMinute: doublePrecision("creep_score_per_minute"), // Ensure creep score per minute is not null
  goldEarned: integer("gold_earned"), // Ensure gold earned is not null
  goldEarnedPerMinute: doublePrecision("gold_earned_per_minute"), // Ensure gold earned per minute is not null
  firstBloodKill: boolean("first_blood_kill"), // Ensure first blood kill is not null
  firstBloodAssist: boolean("first_blood_assist"), // Ensure first blood assist is not null
  firstBloodVictim: boolean("first_blood_victim"), // Ensure first blood victim is not null
});

// Define team game stats table
export const teamGameStats = pgTable("team_game_stats", {
  id: serial("id").primaryKey(),
  platformGameId: varchar("platform_game_id").references(
    () => games.platformGameId,
  ), // Ensure platformGameId is not null
  teamTag: varchar("team_tag").references(() => teams.teamTag), // Ensure teamTag is not null
  side: integer("side"), // Ensure side is not null (1 for Blue, 2 for Red)
  win: boolean("win"), // Ensure win status is not null
  teamKills: integer("team_kills"), // Ensure team kills is not null
  teamDeaths: integer("team_deaths"), // Ensure team deaths is not null
  wardsPlacedPerMinute: doublePrecision("wards_placed_per_minute"), // Ensure wards placed per minute is not null
  wardsClearedPerMinute: doublePrecision("wards_cleared_per_minute"), // Ensure wards cleared per minute is not null
  controlWardsPurchased: integer("control_wards_purchased"), // Ensure control wards purchased is not null
  creepScorePerMinute: doublePrecision("creep_score_per_minute"), // Ensure creep score per minute is not null
  goldEarnedPerMinute: doublePrecision("gold_earned_per_minute"), // Ensure gold earned per minute is not null
  firstTurret: boolean("first_turret"), // Ensure first turret is not null
  turretKills: integer("turret_kills"), // Ensure turret kills is not null
  turretPlates: integer("turret_plates"), // Ensure turret plates is not null
  firstDragon: boolean("first_dragon"), // Ensure first dragon is not null
  dragonKills: integer("dragon_kills"), // Ensure dragon kills is not null
  firstHerald: boolean("first_herald"), // Ensure first herald is not null
  riftHeraldKills: integer("rift_herald_kills"), // Ensure rift herald kills is not null
  baronKills: integer("baron_kills"), // Ensure baron kills is not null
  inhibitorKills: integer("inhibitor_kills"), // Ensure inhibitor kills is not null
  bannedChampions: jsonb("banned_champions"), // Ensure banned champions JSON is not null
  banPickTurns: jsonb("ban_pick_turns"), // Ensure ban/pick turns JSON is not null
});
