import traceback
import json
import sys
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from LoLStatsDB import LoLStatsDB

CONFIG = {
    "api_key": "3ZEq1vZWXUAI9HDaiiY7dbH16ximLKWzclNLlkkf",
    "logging": "on",
    "debug": True,
}

# GraphQL Queries
SERIES_INFO_QUERY = """
    {
        series (id: "%s") {
            id
            type
            tournament {
                id
                name
                nameShortened
            }
        }
    }
"""

SERIES_STATE_QUERY = """
    {
        seriesState (id: "%s") {
            id
            games {
                id
                sequenceNumber
                started
                finished
            }
        }
    }
"""

def output_json(data: Dict[str, Any]) -> None:
    """Safely output JSON data to stdout."""
    try:
        # Ensure we're writing to stdout
        print(json.dumps(data, default=str), file=sys.stdout)
        # Flush to ensure immediate output
        sys.stdout.flush()
    except Exception as e:
        error_msg = {"error": f"Failed to serialize response: {str(e)}"}
        print(json.dumps(error_msg), file=sys.stdout)
        sys.stdout.flush()

@dataclass
class Ban:
    champion_id: int
    champion_name: str
    champion_key: str
    champion_image_url: str
    pick_turn: int

@dataclass
class Player:
    summoner_name: str
    team_tag: str
    champion_name: str
    champion_image_url: str
    stats: Dict

@dataclass
class Team:
    team_tag: str
    side: int
    players: List[Player]
    objectives: Dict
    bans: List[Ban]

@dataclass
class Game:
    platform_game_id: str
    duration: int
    winner_side: int
    teams: List[Team]
    patch: str 

@dataclass
class Series:
    series_id: str
    tournament_id: str
    tournament_name: str
    games: List[Game]

class APIClient:
    def __init__(self, api_key: str):
        self.headers = {"x-api-key": api_key}
        self.base_url = "https://api.grid.gg"

    async def get(self, endpoint: str) -> dict:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/{endpoint}",
                headers=self.headers
            ) as response:
                if CONFIG["debug"]:
                    print(f"DEBUG: GET {endpoint}", file=sys.stderr)
                    print(f"DEBUG: Status: {response.status}", file=sys.stderr)
                    print(f"DEBUG: Content-Type: {response.headers.get('Content-Type')}", file=sys.stderr)
                    
                if response.status == 200:
                    text = await response.text()
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError as e:
                        if CONFIG["debug"]:
                            print(f"DEBUG: JSON decode error: {str(e)}", file=sys.stderr)
                            print(f"DEBUG: Response text: {text[:200]}...", file=sys.stderr)
                        raise Exception(f"Failed to parse response as JSON: {str(e)}")
                else:
                    raise Exception(f"API request failed: {response.status}")

    async def post(self, query: str, endpoint: str = "central-data/graphql") -> dict:
        async with aiohttp.ClientSession() as session:
            if CONFIG["debug"]:
                print(f"DEBUG: POST {endpoint}", file=sys.stderr)
                print(f"DEBUG: Query: {query}", file=sys.stderr)
                
            async with session.post(
                f"{self.base_url}/{endpoint}",
                headers={**self.headers, "Content-Type": "application/json"},
                json={"query": query}
            ) as response:
                if CONFIG["debug"]:
                    print(f"DEBUG: Status: {response.status}", file=sys.stderr)
                
                data = await response.json()
                if "errors" in data:
                    raise Exception(f"Query failed: {data['errors'][0]['message']}")
                return data

class ChampionData:
    def __init__(self):
        self.champion_data = None
        self.version = None

    async def initialize(self):
        self.version = await self._get_latest_version()
        await self._load_champion_data()

    async def _get_latest_version(self) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://ddragon.leagueoflegends.com/api/versions.json") as response:
                versions = await response.json()
                return versions[0]

    async def _load_champion_data(self):
        async with aiohttp.ClientSession() as session:
            url = f"http://ddragon.leagueoflegends.com/cdn/{self.version}/data/en_US/champion.json"
            async with session.get(url) as response:
                data = await response.json()
                self.champion_data = {}
                for champion in data['data'].values():
                    self.champion_data[int(champion['key'])] = {
                        'name': champion['name'],
                        'key': champion['id'],
                        'image': champion['image']['full']
                    }

    def get_champion_info(self, champion_id: int) -> Optional[Dict]:
        return self.champion_data.get(champion_id)

    def get_champion_image_url(self, champion_name: str) -> str:
        normalized_name = self._normalize_champion_name(champion_name)
        return f"https://ddragon.leagueoflegends.com/cdn/{self.version}/img/champion/{normalized_name}.png"

    @staticmethod
    def _normalize_champion_name(name: str) -> str:
        special_cases = {
            "wukong": "MonkeyKing",
            "chogath": "Chogath",
            "kogmaw": "KogMaw",
            "reksai": "RekSai",
            "khazix": "Khazix",
            "velkoz": "Velkoz"
        }
        name = name.replace("'", "").replace(" ", "")
        return special_cases.get(name.lower(), name)

class GameDataProcessor:
    def __init__(self, api_client: APIClient, champion_data: ChampionData):
        self.api = api_client
        self.champion_data = champion_data

    async def process_player(self, player_data: dict, team_stats: dict, game_duration: int) -> Player:
        team_tag, summoner_name = self._split_summoner_name(player_data["riotIdGameName"])
        champion_image_url = self.champion_data.get_champion_image_url(player_data["championName"])
        
        stats = {
            "kills": player_data["kills"],
            "deaths": player_data["deaths"],
            "assists": player_data["assists"],
            "kda": (player_data["kills"] + player_data["assists"]) / max(1, player_data["deaths"]),
            "kill_participation": (player_data["kills"] + player_data["assists"]) / max(1, team_stats["kills"]),
            "damage_per_minute": player_data["totalDamageDealtToChampions"] / (game_duration/60),
            "damage_share": player_data["totalDamageDealtToChampions"] / max(1, team_stats["damage"]),
            "vision_score": player_data["visionScore"],
            "cs_per_minute": (player_data["totalMinionsKilled"] + player_data["neutralMinionsKilled"]) / (game_duration/60),
            "gold_per_minute": player_data["goldEarned"] / (game_duration/60)
        }

        return Player(
            summoner_name=summoner_name,
            team_tag=team_tag,
            champion_name=player_data["championName"],
            champion_image_url=champion_image_url,
            stats=stats
        )

    @staticmethod
    def _split_summoner_name(name: str) -> tuple[str, str]:
        if " " in name and name.find(" ") < 5:
            tag, name = name.split(" ", 1)
            if tag.isupper():
                return tag, name
        return "", name

    def format_game_data(self, processed_game, series_info) -> Optional[Dict[str, Any]]:
        """Format a single game's data into the expected response structure."""
        try:
            blue_team = next((team for team in processed_game.teams if team.side == 100), None)
            red_team = next((team for team in processed_game.teams if team.side == 200), None)
            
            if not blue_team or not red_team:
                print(f"ERROR: Missing team data", file=sys.stderr)
                return None

            return {
                "game": {
                    "platformGameId": processed_game.platform_game_id,
                    "tournament": series_info["tournament"]["name"],
                    "gameDuration": processed_game.duration,
                    "winnerSide": processed_game.winner_side,
                    "gameDate": datetime.now().isoformat(),
                    "blueTeam": blue_team.team_tag or "Blue Team",
                    "redTeam": red_team.team_tag or "Red Team",
                    "patch": processed_game.patch,
                },
                "players": [
                    {
                        "platformGameId": processed_game.platform_game_id,
                        "summonerName": player.summoner_name,
                        "teamTag": player.team_tag,
                        "championName": player.champion_name,
                        "side": team.side,
                        "kills": player.stats["kills"],
                        "deaths": player.stats["deaths"],
                        "assists": player.stats["assists"],
                        "kda": player.stats["kda"],
                        "killParticipation": player.stats["kill_participation"],
                        "damagePerMinute": player.stats["damage_per_minute"],
                        "damageShare": player.stats["damage_share"],
                        "visionScore": player.stats["vision_score"],
                        "csPerMinute": player.stats["cs_per_minute"],
                        "goldPerMinute": player.stats["gold_per_minute"],
                        "role": "unknown"
                    }
                    for team in processed_game.teams
                    for player in team.players
                ],
                "objectives": [
                    {
                        "platformGameId": processed_game.platform_game_id,
                        "teamTag": team.team_tag,
                        "towers": team.objectives["towers"],
                        "dragons": team.objectives["dragons"],
                        "barons": team.objectives["barons"],
                        "heralds": team.objectives["heralds"]
                    }
                    for team in processed_game.teams
                ],
                "bans": [
                    {
                        "platformGameId": processed_game.platform_game_id,
                        "teamTag": team.team_tag,
                        "championName": ban.champion_name,
                        "pickTurn": ban.pick_turn
                    }
                    for team in processed_game.teams
                    for ban in team.bans
                ]
            }
        except Exception as e:
            print(f"ERROR in format_game_data: {str(e)}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            return None

    async def process_game(self, game_data: dict, timeline_data: dict) -> Game:
            # Extract patch version from game_data
        full_patch = game_data.get("gameVersion", "unknown")
        patch = ".".join(full_patch.split(".")[:2]) if full_patch != "unknown" else "unknown"
        print(f"DEBUG: Game version from API: {full_patch}", file=sys.stderr)
        print(f"DEBUG: Extracted patch: {patch}", file=sys.stderr)

        teams = {100: {"kills": 0, "damage": 0}, 200: {"kills": 0, "damage": 0}}
        
        # Calculate team totals
        for participant in game_data["participants"]:
            team_id = participant["teamId"]
            teams[team_id]["kills"] += participant["kills"]
            teams[team_id]["damage"] += participant["totalDamageDealtToChampions"]

        processed_teams = []
        for team_data in game_data["teams"]:
            team_id = team_data["teamId"]
            players = [
                await self.process_player(p, teams[team_id], game_data["gameDuration"])
                for p in game_data["participants"]
                if p["teamId"] == team_id
            ]

            # Process bans with champion information
            processed_bans = []
            if "bans" in team_data and team_data["bans"]:
                for ban in team_data["bans"]:
                    if isinstance(ban, dict) and "championId" in ban and "pickTurn" in ban:
                        champion_id = ban["championId"]
                        champion_info = self.champion_data.get_champion_info(champion_id)
                        
                        if champion_info:
                            processed_bans.append(Ban(
                                champion_id=champion_id,
                                champion_name=champion_info['name'],
                                champion_key=champion_info['key'],
                                champion_image_url=f"https://ddragon.leagueoflegends.com/cdn/{self.champion_data.version}/img/champion/{champion_info['image']}",
                                pick_turn=ban["pickTurn"]
                            ))

            processed_teams.append(Team(
                team_tag=players[0].team_tag if players else "",
                side=team_id,
                players=players,
                objectives={
                    "towers": team_data["objectives"]["tower"]["kills"],
                    "dragons": team_data["objectives"]["dragon"]["kills"],
                    "barons": team_data["objectives"]["baron"]["kills"],
                    "heralds": team_data["objectives"]["riftHerald"]["kills"]
                },
                bans=processed_bans
            ))

        return Game(
            platform_game_id=f"{game_data['platformId']}_{game_data['gameId']}",
            duration=game_data["gameDuration"],
            winner_side=100 if game_data["teams"][0]["win"] else 200,
            teams=processed_teams,
            patch=patch
        )

async def main():
    try:
        # Initialize components
        print("Initializing components...", file=sys.stderr)
        api_client = APIClient(CONFIG["api_key"])
        champion_data = ChampionData()
        await champion_data.initialize()
        processor = GameDataProcessor(api_client, champion_data)
        
        # Initialize database connection
        print("Connecting to database...", file=sys.stderr)
        db = LoLStatsDB("postgresql://postgres:sinja@localhost:5432/esports")
        
        series_id = sys.argv[1] if len(sys.argv) > 1 else None
        if not series_id:
            output_json({"error": "No series ID provided"})
            return

        print(f"Processing series {series_id}...", file=sys.stderr)
        
        # Get series info
        series_response = await api_client.post(SERIES_INFO_QUERY % series_id)
        series_info = series_response["data"]["series"]
        
        # Get series state
        state_response = await api_client.post(
            SERIES_STATE_QUERY % series_id,
            endpoint="live-data-feed/series-state/graphql"
        )
        games_info = state_response["data"]["seriesState"]["games"]
        
        if not games_info:
            output_json({"error": "No games found in series"})
            return
        # Process first game only
        game = games_info[0]
        try:
            game_data = await api_client.get(
                f"file-download/end-state/riot/series/{series_id}/games/{game['sequenceNumber']}/summary"
            )
            timeline_data = await api_client.get(
                f"file-download/end-state/riot/series/{series_id}/games/{game['sequenceNumber']}/details"
            )
            
            processed_game = await processor.process_game(game_data, timeline_data)
            formatted_data = processor.format_game_data(processed_game, series_info)
            
            if formatted_data is None:
                output_json({"error": "Failed to format game data"})
                return
                
            # Store in database
            series = Series(
                series_id=series_id,
                tournament_id=series_info["tournament"]["id"],
                tournament_name=series_info["tournament"]["name"],
                games=[processed_game]
            )
            db.insert_series_data([series])
            
            # Output the formatted data
            output_json(formatted_data)
            
        except Exception as e:
            print(f"Error processing game: {str(e)}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            output_json({"error": f"Failed to process game: {str(e)}"})
            
    except Exception as e:
        print(f"Fatal error: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        output_json({"error": f"Fatal error: {str(e)}"})

if __name__ == "__main__":
    asyncio.run(main())