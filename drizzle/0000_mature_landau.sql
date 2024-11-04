CREATE TABLE IF NOT EXISTS "bans" (
	"platform_game_id" text PRIMARY KEY NOT NULL,
	"team_tag" text PRIMARY KEY NOT NULL,
	"champion_name" text,
	"pick_turn" integer PRIMARY KEY NOT NULL,
	CONSTRAINT "bans_pkey" PRIMARY KEY("platform_game_id","team_tag","pick_turn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "champions" (
	"champion_name" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"platform_game_id" text PRIMARY KEY NOT NULL,
	"tournament_id" text,
	"game_duration" integer NOT NULL,
	"winner_side" integer NOT NULL,
	"game_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_game_stats" (
	"platform_game_id" text PRIMARY KEY NOT NULL,
	"summoner_name" text PRIMARY KEY NOT NULL,
	"team_tag" text,
	"champion_name" text,
	"side" integer NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"kda" double precision NOT NULL,
	"kill_participation" double precision NOT NULL,
	"damage_per_minute" double precision NOT NULL,
	"damage_share" double precision NOT NULL,
	"vision_score" integer NOT NULL,
	"cs_per_minute" double precision NOT NULL,
	"gold_per_minute" double precision NOT NULL,
	CONSTRAINT "player_game_stats_pkey" PRIMARY KEY("platform_game_id","summoner_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "players" (
	"summoner_name" text PRIMARY KEY NOT NULL,
	"team_tag" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'unknown' NOT NULL,
	CONSTRAINT "players_pkey" PRIMARY KEY("summoner_name","team_tag")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_objectives" (
	"platform_game_id" text PRIMARY KEY NOT NULL,
	"team_tag" text PRIMARY KEY NOT NULL,
	"towers" integer NOT NULL,
	"dragons" integer NOT NULL,
	"barons" integer NOT NULL,
	"heralds" integer NOT NULL,
	CONSTRAINT "team_objectives_pkey" PRIMARY KEY("platform_game_id","team_tag")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"team_tag" text PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournaments" (
	"tournament_id" text PRIMARY KEY NOT NULL,
	"tournament_name" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bans" ADD CONSTRAINT "bans_platform_game_id_games_platform_game_id_fk" FOREIGN KEY ("platform_game_id") REFERENCES "public"."games"("platform_game_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bans" ADD CONSTRAINT "bans_team_tag_teams_team_tag_fk" FOREIGN KEY ("team_tag") REFERENCES "public"."teams"("team_tag") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bans" ADD CONSTRAINT "bans_champion_name_champions_champion_name_fk" FOREIGN KEY ("champion_name") REFERENCES "public"."champions"("champion_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_tournament_id_tournaments_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("tournament_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_game_stats" ADD CONSTRAINT "player_game_stats_platform_game_id_games_platform_game_id_fk" FOREIGN KEY ("platform_game_id") REFERENCES "public"."games"("platform_game_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_game_stats" ADD CONSTRAINT "player_game_stats_team_tag_teams_team_tag_fk" FOREIGN KEY ("team_tag") REFERENCES "public"."teams"("team_tag") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_game_stats" ADD CONSTRAINT "player_game_stats_champion_name_champions_champion_name_fk" FOREIGN KEY ("champion_name") REFERENCES "public"."champions"("champion_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "players" ADD CONSTRAINT "players_team_tag_teams_team_tag_fk" FOREIGN KEY ("team_tag") REFERENCES "public"."teams"("team_tag") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_objectives" ADD CONSTRAINT "team_objectives_platform_game_id_games_platform_game_id_fk" FOREIGN KEY ("platform_game_id") REFERENCES "public"."games"("platform_game_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_objectives" ADD CONSTRAINT "team_objectives_team_tag_teams_team_tag_fk" FOREIGN KEY ("team_tag") REFERENCES "public"."teams"("team_tag") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
