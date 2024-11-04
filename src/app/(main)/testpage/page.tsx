import { getRecentGames, getGameDetails } from "~/server/db/data";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import type { Game, Player, Objective, Ban } from "~/server/db/data";
import SeriesDataForm from "~/components/SeriesForm";

export default async function LeaguePage() {
  try {
    const recentGames = await getRecentGames(5);

    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-3xl font-bold">
          League of Legends Match History
        </h1>
        <SeriesDataForm />
        <div className="space-y-6">
          {recentGames.map((game) => (
            <GameCard key={game.platformGameId} game={game} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load recent games:", error);
    return <div>Failed to load recent games. Please try again later.</div>;
  }
}

async function GameCard({ game }: { game: Game }) {
  try {
    const [players, objectives, bans] = await getGameDetails(
      game.platformGameId,
    );

    // Filter and sort players by role for both teams
    const blueTeam = sortPlayersByRole(players.filter((p) => p.side === 100));
    const redTeam = sortPlayersByRole(players.filter((p) => p.side === 200));

    const winner = game.winnerSide === 100 ? game.blueTeam : game.redTeam;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{game.tournament}</span>
            <span className="text-sm font-normal">
              {formatDistanceToNow(new Date(game.gameDate), {
                addSuffix: true,
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-600">
                {game.blueTeam}
              </span>
              <span>vs</span>
              <span className="font-semibold text-red-600">{game.redTeam}</span>
            </div>
            <div className="text-sm">
              Duration: {Math.floor(game.gameDuration / 60)}:
              {(game.gameDuration % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Display the platformGameId */}
          <div className="mb-2">
            <span className="font-medium">Game ID:</span> {game.platformGameId}
          </div>

          {/* Display the winner */}
          <div className="mb-2">
            <span className="font-medium">Winner:</span> {winner}
          </div>

          <Tabs defaultValue="players">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="objectives">Objectives</TabsTrigger>
              <TabsTrigger value="bans">Bans</TabsTrigger>
            </TabsList>
            <TabsContent value="players">
              <div className="grid grid-cols-2 gap-4">
                <TeamStats team={blueTeam} side="Blue" />
                <TeamStats team={redTeam} side="Red" />
              </div>
            </TabsContent>
            <TabsContent value="objectives">
              <div className="grid grid-cols-2 gap-4">
                {objectives.map((obj) => (
                  <Card key={obj.teamTag}>
                    <CardHeader>
                      <CardTitle>
                        {blueTeam &&
                        blueTeam[0] &&
                        obj.teamTag === blueTeam[0].teamTag
                          ? "Blue Team"
                          : "Red Team"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Towers: {obj.towers}</div>
                        <div>Dragons: {obj.dragons}</div>
                        <div>Barons: {obj.barons}</div>
                        <div>Heralds: {obj.heralds}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="bans">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>
                        {index === 0 ? "Blue Team" : "Red Team"} Bans
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {bans
                          .filter((ban) =>
                            index === 0 ? ban.side === 100 : ban.side === 200,
                          )
                          .map((ban) => (
                            <Avatar key={ban.championName}>
                              <AvatarImage
                                src={ban.championImage || undefined}
                                alt={ban.championName || undefined}
                              />
                              <AvatarFallback>
                                {ban.championName?.substring(0, 2) || "NA"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Failed to load game details:", error);
    return <div>Failed to load game details. Please try again later.</div>;
  }
}

function TeamStats({ team, side }: { team: Player[]; side: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{side} Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {team.map((player) => (
            <div
              key={player.summonerName}
              className="flex items-center space-x-2"
            >
              <Avatar>
                <AvatarImage
                  src={player.championImage || undefined}
                  alt={player.championName || undefined}
                />
                <AvatarFallback>
                  {player.championName?.substring(0, 2) || "NA"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{player.summonerName}</div>
                <div className="text-sm text-muted-foreground">
                  {player.role} - {player.kills}/{player.deaths}/
                  {player.assists} KDA
                </div>
              </div>
              <div className="ml-auto text-sm">
                <div>{Math.round(player.csPerMinute * 10) / 10} CS/min</div>
                <div>{Math.round(player.goldPerMinute)} Gold/min</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function sortPlayersByRole(players: Player[]): Player[] {
  const roleOrder = ["top", "jungle", "mid", "adc", "support"];

  return players.sort((a, b) => {
    const aRole = a.role?.toLowerCase() || "";
    const bRole = b.role?.toLowerCase() || "";

    // Handle cases where the role is not one of the standard 5
    if (!roleOrder.includes(aRole)) {
      return 1; // Move unknown roles to the end
    }
    if (!roleOrder.includes(bRole)) {
      return -1;
    }

    return roleOrder.indexOf(aRole) - roleOrder.indexOf(bRole);
  });
}
