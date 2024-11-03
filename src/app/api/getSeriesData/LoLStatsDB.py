import psycopg
from psycopg import sql
from datetime import datetime
import json
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class LoLStatsDB:
    def __init__(self, connection_string: str):
        self.conn_string = connection_string

    def safe_cast(self, value: Any, to_type: type, default: Optional[Any] = None):
        """Safely cast a value to the given type, return default if casting fails."""
        try:
            return to_type(value)
        except (ValueError, TypeError):
            return default

    def get_team_name_by_tag(self, team_tag: str) -> Optional[str]:
        """Retrieve the team name based on the team tag. (Optional, can be removed if not needed)"""
        # This function is now optional, consider removing if not needed elsewhere.
        with psycopg.connect(self.conn_string) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT team_name FROM teams WHERE team_tag = %s", (team_tag,))
                result = cur.fetchone()
                return result[0] if result else None

    def insert_game_data(self, data: List[Dict[Any, Any]]):
        player_game_stats_to_insert = []
        with psycopg.connect(self.conn_string) as conn:
            with conn.cursor() as cur:
                for entry in data:
                    try:
                        # Log the entry data for debugging
                        logging.debug(f"Processing entry: {entry}")

                        tournament_id = entry.get('tournament_id')
                        tournament_name = entry.get('tournament_name')
                        team_tag = entry.get('team_tag')
                        platform_game_id = entry.get('platform_game_id')
                        champion = entry.get('champion')

                        # Insert tournament data
                        if tournament_id and tournament_name:
                            try:
                                logging.debug(f"Inserting tournament data: {tournament_id}, {tournament_name}")
                                cur.execute(""" 
                                    INSERT INTO tournaments (tournament_id, tournament_name) 
                                    VALUES (%s, %s) 
                                    ON CONFLICT (tournament_id) DO UPDATE 
                                    SET tournament_name = EXCLUDED.tournament_name
                                """, (tournament_id, tournament_name))
                            except Exception as e:
                                logging.error(f"Failed to insert tournament data: {tournament_id}, {tournament_name} - {e}")

                        # Directly use team_tag as team_name
                        if team_tag:
                            try:
                                logging.debug(f"Inserting team data: {team_tag}, {team_tag}")
                                cur.execute(""" 
                                    INSERT INTO teams (team_tag, team_name) 
                                    VALUES (%s, %s) 
                                    ON CONFLICT (team_tag) DO NOTHING 
                                """, (team_tag, team_tag))
                            except Exception as e:
                                logging.error(f"Failed to insert team data: {team_tag} - {e}")
                        else:
                            logging.warning(f"Missing team_tag. Skipping this entry.")
                            continue

                        # Player data handling
                        if 'summoner_name' in entry:
                            player_id = entry.get('player_id')  # Ensure player_id is defined here
                            player_game_stats_to_insert.append(( 
                                platform_game_id, player_id, entry.get('champion'),
                                self.safe_cast(entry.get('side'), int, 0), entry.get('auto_detect_role'),
                                self.safe_cast(entry.get('win'), bool, False),
                                entry.get('kills'), entry.get('deaths'), entry.get('assists'), 
                                entry.get('kda'), entry.get('kill_participation'), 
                                entry.get('damagePerMinute'), entry.get('damageShare'), 
                                entry.get('wardsPlacedPerMinute'), entry.get('wardsClearedPerMinute'), 
                                entry.get('controlWardsPurchased'), entry.get('creepScore'), 
                                entry.get('creepScorePerMinute'), entry.get('goldEarned'), 
                                entry.get('goldEarnedPerMinute'), entry.get('firstBloodKill'), 
                                entry.get('firstBloodAssist'), entry.get('firstBloodVictim')
                            ))

                        # Champion data
                        if champion:
                            try:
                                logging.debug(f"Inserting champion data: {champion}")
                                cur.execute(""" 
                                    INSERT INTO champions (champion_name, image_url) 
                                    VALUES (%s, %s) 
                                    ON CONFLICT (champion_name) DO UPDATE 
                                    SET image_url = EXCLUDED.image_url 
                                """, (champion, entry.get('championImageUrl')))
                            except Exception as e:
                                logging.error(f"Failed to insert champion data: {champion} - {e}")

                        # Game data
                        game_date = entry.get('game_date')
                        if game_date is None:
                            logging.warning(f"Missing game_date for platform_game_id {platform_game_id}. Skipping this entry.")
                            continue

                        try:
                            logging.debug(f"Inserting game data: {platform_game_id}, {tournament_id}, {game_date}")
                            cur.execute(""" 
                                INSERT INTO games (platform_game_id, tournament_id, game_duration, game_date) 
                                VALUES (%s, %s, %s, %s) 
                                ON CONFLICT (platform_game_id) DO NOTHING 
                            """, ( 
                                platform_game_id, 
                                tournament_id, 
                                self.safe_cast(entry.get('game_duration'), int, 0), 
                                game_date  
                            ))
                        except Exception as e:
                            logging.error(f"Failed to insert game data: {platform_game_id} - {e}")

                    except Exception as e:
                        logging.error(f"Error processing entry: {e}")

                # Batch insert player game stats if available
                if player_game_stats_to_insert:
                    try:
                        logging.debug(f"Inserting player game stats for {len(player_game_stats_to_insert)} entries.")
                        cur.executemany(""" 
                            INSERT INTO player_game_stats ( 
                                platform_game_id, player_id, champion_name, side, role, 
                                win, kills, deaths, assists, kda, kill_participation, 
                                damage_per_minute, damage_share, wards_placed_per_minute, 
                                wards_cleared_per_minute, control_wards_purchased, 
                                creep_score, creep_score_per_minute, gold_earned, 
                                gold_earned_per_minute, first_blood_kill, 
                                first_blood_assist, first_blood_victim 
                            ) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                            ON CONFLICT (platform_game_id, player_id) DO UPDATE 
                            SET champion_name = EXCLUDED.champion_name 
                        """, player_game_stats_to_insert)
                    except Exception as e:
                        logging.error(f"Error inserting player game stats: {e}")

                # Commit transaction
                conn.commit()
                logging.info("Transaction committed successfully.")
