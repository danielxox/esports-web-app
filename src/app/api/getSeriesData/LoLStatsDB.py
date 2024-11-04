import psycopg
from psycopg import sql
from datetime import datetime
import logging
from typing import List, Dict, Any, Optional
from dataclasses import asdict

class LoLStatsDB:
    def __init__(self, connection_string: str):
        self.conn_string = connection_string
        logging.basicConfig(level=logging.INFO, 
                          format='%(asctime)s - %(levelname)s - %(message)s')

    def insert_series_data(self, series_list: List):
        """
        Insert complete series data including all games, teams, players, and stats
        """
        with psycopg.connect(self.conn_string) as conn:
            with conn.cursor() as cur:
                for series in series_list:
                    try:
                        series_dict = asdict(series)
                        
                        # Insert tournament data
                        self._insert_tournament(cur, {
                            'tournament_id': series.tournament_id,
                            'tournament_name': series.tournament_name
                        })

                        # Process each game in the series
                        for game in series.games:
                            self._process_game(cur, game, series.tournament_id)

                        conn.commit()
                        logging.info(f"Successfully processed series {series.series_id}")

                    except Exception as e:
                        logging.error(f"Error processing series {series.series_id}: {e}")
                        conn.rollback()

    def _insert_tournament(self, cur: psycopg.Cursor, tournament: Dict):
        """Insert tournament data with conflict handling"""
        cur.execute("""
            INSERT INTO tournaments (tournament_id, tournament_name)
            VALUES (%s, %s)
            ON CONFLICT (tournament_id) DO UPDATE
            SET tournament_name = EXCLUDED.tournament_name
        """, (tournament['tournament_id'], tournament['tournament_name']))

    def _insert_team(self, cur: psycopg.Cursor, team_tag: str):
        """Insert team data with conflict handling"""
        cur.execute("""
            INSERT INTO teams (team_tag, team_name)
            VALUES (%s, %s)
            ON CONFLICT (team_tag) DO UPDATE
            SET team_name = EXCLUDED.team_name
        """, (team_tag, team_tag))  # Using team_tag as name for simplicity

    def _insert_champion(self, cur: psycopg.Cursor, champion_name: str, image_url: str):
        """Insert champion data with conflict handling"""
        cur.execute("""
            INSERT INTO champions (champion_name, image_url)
            VALUES (%s, %s)
            ON CONFLICT (champion_name) DO UPDATE
            SET image_url = EXCLUDED.image_url
        """, (champion_name, image_url))

    def _insert_ban(self, cur: psycopg.Cursor, ban, platform_game_id: str, team_tag: str):
        """Insert ban data"""
        cur.execute("""
            INSERT INTO bans (platform_game_id, team_tag, champion_name, pick_turn)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (platform_game_id, team_tag, pick_turn) DO UPDATE
            SET champion_name = EXCLUDED.champion_name
        """, (platform_game_id, team_tag, ban.champion_name, ban.pick_turn))

    def _insert_game(self, cur: psycopg.Cursor, game, tournament_id: str):
        """Insert game data with conflict handling"""
        cur.execute("""
            INSERT INTO games (
                platform_game_id, tournament_id, game_duration, 
                winner_side, game_date
            )
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (platform_game_id) DO NOTHING
            RETURNING platform_game_id
        """, (
            game.platform_game_id,
            tournament_id,
            game.duration,
            game.winner_side
        ))

    def _insert_team_objectives(self, cur: psycopg.Cursor, objectives: Dict, platform_game_id: str, team_tag: str):
        """Insert team objectives data"""
        cur.execute("""
            INSERT INTO team_objectives (
                platform_game_id, team_tag, towers, dragons, 
                barons, heralds
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (platform_game_id, team_tag) DO UPDATE
            SET 
                towers = EXCLUDED.towers,
                dragons = EXCLUDED.dragons,
                barons = EXCLUDED.barons,
                heralds = EXCLUDED.heralds
        """, (
            platform_game_id,
            team_tag,
            objectives['towers'],
            objectives['dragons'],
            objectives['barons'],
            objectives['heralds']
        ))

    def _insert_player_stats(self, cur: psycopg.Cursor, player, platform_game_id: str, team_tag: str, side: int):
        """Insert player game statistics"""
        stats = player.stats
        
        # First ensure the player exists in players table
        cur.execute("""
            INSERT INTO players (summoner_name, team_tag)
            VALUES (%s, %s)
            ON CONFLICT (summoner_name, team_tag) DO NOTHING
        """, (player.summoner_name, team_tag))

        # Then insert the game stats
        cur.execute("""
            INSERT INTO player_game_stats (
                platform_game_id, summoner_name, team_tag, champion_name,
                side, kills, deaths, assists, kda,
                kill_participation, damage_per_minute, damage_share,
                vision_score, cs_per_minute, gold_per_minute
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (platform_game_id, summoner_name) DO UPDATE
            SET 
                champion_name = EXCLUDED.champion_name,
                kills = EXCLUDED.kills,
                deaths = EXCLUDED.deaths,
                assists = EXCLUDED.assists,
                kda = EXCLUDED.kda,
                kill_participation = EXCLUDED.kill_participation,
                damage_per_minute = EXCLUDED.damage_per_minute,
                damage_share = EXCLUDED.damage_share,
                vision_score = EXCLUDED.vision_score,
                cs_per_minute = EXCLUDED.cs_per_minute,
                gold_per_minute = EXCLUDED.gold_per_minute
        """, (
            platform_game_id,
            player.summoner_name,
            team_tag,
            player.champion_name,
            side,
            stats['kills'],
            stats['deaths'],
            stats['assists'],
            stats['kda'],
            stats['kill_participation'],
            stats['damage_per_minute'],
            stats['damage_share'],
            stats['vision_score'],
            stats['cs_per_minute'],
            stats['gold_per_minute']
        ))

    def _process_game(self, cur: psycopg.Cursor, game, tournament_id: str):
        """Process a complete game including teams, players, and objectives"""
        # Insert base game data
        self._insert_game(cur, game, tournament_id)
        
        # Process each team
        for team in game.teams:
            # Insert team data
            self._insert_team(cur, team.team_tag)
            
            # Insert team objectives
            self._insert_team_objectives(
                cur, 
                team.objectives,
                game.platform_game_id,
                team.team_tag
            )
            
            # Process bans
            for ban in team.bans:
                # Insert champion data for banned champion
                self._insert_champion(cur, ban.champion_name, ban.champion_image_url)
                # Insert ban data
                self._insert_ban(cur, ban, game.platform_game_id, team.team_tag)
            
            # Process players
            for player in team.players:
                # Insert champion data for picked champion
                self._insert_champion(cur, player.champion_name, player.champion_image_url)
                # Insert player stats
                self._insert_player_stats(
                    cur,
                    player,
                    game.platform_game_id,
                    team.team_tag,
                    team.side
                )