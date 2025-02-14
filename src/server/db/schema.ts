import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  doublePrecision,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  author_id: uuid("author_id").notNull(),
  author_name: varchar("author_name", { length: 100 }).notNull(),
  author_avatar: varchar("author_avatar", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  tournamentId: text("tournament_id").primaryKey().notNull(),
  tournamentName: text("tournament_name").notNull(),
});

export const teams = pgTable("teams", {
  teamTag: text("team_tag").primaryKey().notNull(),
  teamName: text("team_name").notNull(),
});

export const champions = pgTable("champions", {
  championName: text("champion_name").primaryKey().notNull(),
  imageUrl: text("image_url").notNull(),
});

export const games = pgTable("games", {
  platformGameId: text("platform_game_id").primaryKey().notNull(),
  tournamentId: text("tournament_id").references(
    () => tournaments.tournamentId,
  ),
  gameDuration: integer("game_duration").notNull(),
  winnerSide: integer("winner_side").notNull(), // Consider using an enum for clarity
  gameDate: timestamp("game_date", { mode: "string" }).notNull(),
  patch: text("patch").notNull().default("unknown"),
});

export const playerGameStats = pgTable(
  "player_game_stats",
  {
    platformGameId: text("platform_game_id")
      .notNull()
      .references(() => games.platformGameId),
    summonerName: text("summoner_name").notNull(),
    teamTag: text("team_tag").references(() => teams.teamTag),
    championName: text("champion_name").references(
      () => champions.championName,
    ),
    side: integer("side").notNull(),
    kills: integer("kills").notNull(),
    deaths: integer("deaths").notNull(),
    assists: integer("assists").notNull(),
    kda: doublePrecision("kda").notNull(),
    killParticipation: doublePrecision("kill_participation").notNull(),
    damagePerMinute: doublePrecision("damage_per_minute").notNull(),
    damageShare: doublePrecision("damage_share").notNull(),
    visionScore: integer("vision_score").notNull(),
    csPerMinute: doublePrecision("cs_per_minute").notNull(),
    goldPerMinute: doublePrecision("gold_per_minute").notNull(),
  },
  (table) => {
    return {
      playerGameStatsPkey: primaryKey({
        columns: [table.platformGameId, table.summonerName],
        name: "player_game_stats_pkey",
      }),
    };
  },
);

export const teamObjectives = pgTable(
  "team_objectives",
  {
    platformGameId: text("platform_game_id")
      .notNull()
      .references(() => games.platformGameId),
    teamTag: text("team_tag")
      .notNull()
      .references(() => teams.teamTag),
    towers: integer("towers").notNull(),
    dragons: integer("dragons").notNull(),
    barons: integer("barons").notNull(),
    heralds: integer("heralds").notNull(),
  },
  (table) => {
    return {
      teamObjectivesPkey: primaryKey({
        columns: [table.platformGameId, table.teamTag],
        name: "team_objectives_pkey",
      }),
    };
  },
);

export const bans = pgTable(
  "bans",
  {
    platformGameId: text("platform_game_id")
      .notNull()
      .references(() => games.platformGameId),
    teamTag: text("team_tag")
      .notNull()
      .references(() => teams.teamTag),
    championName: text("champion_name")
      .notNull()
      .references(() => champions.championName),
    pickTurn: integer("pick_turn").notNull(),
  },
  (table) => {
    return {
      bansPkey: primaryKey({
        columns: [table.platformGameId, table.teamTag, table.pickTurn],
        name: "bans_pkey",
      }),
    };
  },
);

export const players = pgTable(
  "players",
  {
    summonerName: text("summoner_name").notNull(),
    teamTag: text("team_tag")
      .notNull()
      .references(() => teams.teamTag),
    role: text("role").notNull().default("unknown"),
  },
  (table) => {
    return {
      playersPkey: primaryKey({
        columns: [table.summonerName, table.teamTag],
        name: "players_pkey",
      }),
    };
  },
);
