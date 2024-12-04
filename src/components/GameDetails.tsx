// GameDetails.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Game {
  platformGameId: string;
  tournament: string;
  gameDuration: number;
  winnerSide: number;
  gameDate: string;
  blueTeam: string;
  redTeam: string;
  patch?: string;
}

interface Player {
  platformGameId: string;
  summonerName: string;
  teamTag: string | null;
  championName: string | null;
  championImage?: string;
  side: number;
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
  role?: string;
}

interface Objective {
  platformGameId: string;
  teamTag: string;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
}

interface Ban {
  platformGameId: string;
  teamTag: string;
  championName: string;
  pickTurn: number;
}

interface GameDetailsProps {
  game: Game;
  players: Player[];
  objectives: Objective[];
  bans: Ban[];
}

const roleOrder = ["top", "jungle", "mid", "adc", "support"] as const;

const getRoleFromIndex = (index: number): string => {
  return roleOrder[index % 5] ?? "";
};

const GameDetails = ({ game, players, objectives, bans }: GameDetailsProps) => {
  console.log("Game data in GameDetails:", game); // Debug log
  // Split players by team and assign roles based on position
  const blueTeam = players
    .filter((p) => p.side === 100)
    .map((player, index) => ({
      ...player,
      role: getRoleFromIndex(index),
    }));

  const redTeam = players
    .filter((p) => p.side === 200)
    .map((player, index) => ({
      ...player,
      role: getRoleFromIndex(index),
    }));

  const getChampionImageUrl = (championName: string) => {
    if (!championName) return "";
    const formattedName = championName.replace(/[^a-zA-Z]/g, "");
    return `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${formattedName}.png`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Game Details</CardTitle>
              <div className="flex flex-col gap-1">
                <CardDescription>ID: {game.platformGameId}</CardDescription>
                <CardDescription>
                  Duration: {formatDuration(game.gameDuration)}
                </CardDescription>
                {game.patch && (
                  <CardDescription>
                    <span className="font-medium">Patch:</span> {game.patch}
                  </CardDescription>
                )}
              </div>
            </div>
            <Badge
              variant={game.winnerSide === 100 ? "default" : "destructive"}
            >
              Winner: {game.winnerSide === 100 ? game.blueTeam : game.redTeam}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Blue Team Card */}
        <Card className={`${game.winnerSide === 100 ? "border-blue-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-blue-600 dark:text-blue-400">
                {game.blueTeam}
              </span>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        🏰{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === blueTeam[0]?.teamTag,
                        )?.towers ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Towers Destroyed</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        🐲{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === blueTeam[0]?.teamTag,
                        )?.dragons ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Dragons Slain</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        👑{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === blueTeam[0]?.teamTag,
                        )?.barons ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Barons Killed</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {bans
                .filter((ban) => ban.teamTag === blueTeam[0]?.teamTag)
                .sort((a, b) => a.pickTurn - b.pickTurn)
                .map((ban) => (
                  <TooltipProvider key={`${ban.teamTag}-${ban.pickTurn}`}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar>
                          <AvatarImage
                            src={getChampionImageUrl(ban.championName)}
                            alt={ban.championName}
                          />
                          <AvatarFallback>Ban</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        {ban.championName} (Ban {ban.pickTurn})
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Red Team Card */}
        <Card className={`${game.winnerSide === 200 ? "border-red-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-red-600 dark:text-red-400">
                {game.redTeam}
              </span>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        🏰{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === redTeam[0]?.teamTag,
                        )?.towers ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Towers Destroyed</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        🐲{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === redTeam[0]?.teamTag,
                        )?.dragons ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Dragons Slain</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        👑{" "}
                        {objectives.find(
                          (obj) => obj.teamTag === redTeam[0]?.teamTag,
                        )?.barons ?? 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Barons Killed</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {bans
                .filter((ban) => ban.teamTag === redTeam[0]?.teamTag)
                .sort((a, b) => a.pickTurn - b.pickTurn)
                .map((ban) => (
                  <TooltipProvider key={`${ban.teamTag}-${ban.pickTurn}`}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar>
                          <AvatarImage
                            src={getChampionImageUrl(ban.championName)}
                            alt={ban.championName}
                          />
                          <AvatarFallback>Ban</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        {ban.championName} (Ban {ban.pickTurn})
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Blue Team</TableHead>
                <TableHead className="w-16 text-center">K/D/A</TableHead>
                <TableHead className="w-24 text-center">DMG%</TableHead>
                <TableHead className="w-24 text-center">VS</TableHead>
                <TableHead className="w-24 border-r text-center">
                  CS/min
                </TableHead>
                <TableHead className="w-[200px]">Red Team</TableHead>
                <TableHead className="w-16 text-center">K/D/A</TableHead>
                <TableHead className="w-24 text-center">DMG%</TableHead>
                <TableHead className="w-24 text-center">VS</TableHead>
                <TableHead className="w-24 text-center">CS/min</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleOrder.map((role, index) => {
                const bluePlayer = blueTeam[index];
                const redPlayer = redTeam[index];

                return (
                  <TableRow
                    key={role}
                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                  >
                    {/* Blue Player */}
                    <TableCell>
                      {bluePlayer && (
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={getChampionImageUrl(
                                bluePlayer.championName ?? "",
                              )}
                              alt={bluePlayer.championName ?? ""}
                            />
                            <AvatarFallback>
                              {role?.[0]?.toUpperCase() ?? "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {bluePlayer.summonerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bluePlayer.championName}
                              <Badge variant="outline" className="ml-2">
                                {role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {bluePlayer
                        ? `${bluePlayer.kills}/${bluePlayer.deaths}/${bluePlayer.assists}`
                        : "0/0/0"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {bluePlayer
                          ? Math.round(bluePlayer.damageShare * 100)
                          : 0}
                        %
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {bluePlayer?.visionScore ?? 0}
                    </TableCell>
                    <TableCell className="border-r text-center">
                      {bluePlayer?.csPerMinute?.toFixed(1) ?? "0.0"}
                    </TableCell>

                    {/* Red Player */}
                    <TableCell>
                      {redPlayer && (
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={getChampionImageUrl(
                                redPlayer.championName ?? "",
                              )}
                              alt={redPlayer.championName ?? ""}
                            />
                            <AvatarFallback>
                              {role?.[0]?.toUpperCase() ?? "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {redPlayer.summonerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {redPlayer.championName}
                              <Badge variant="outline" className="ml-2">
                                {role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {redPlayer
                        ? `${redPlayer.kills}/${redPlayer.deaths}/${redPlayer.assists}`
                        : "0/0/0"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {redPlayer
                          ? Math.round(redPlayer.damageShare * 100)
                          : 0}
                        %
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {redPlayer?.visionScore ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {redPlayer?.csPerMinute?.toFixed(1) ?? "0.0"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameDetails;
