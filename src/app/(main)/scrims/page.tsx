"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Player {
  summoner_name: string;
  team_tag: string;
  champion: string;
  championImageUrl: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  damageShare: number;
  creepScore: number;
  wardsPlaced: number;
  wardsCleared: number;
}

interface Team {
  team_tag: string;
  side: number;
  win: number;
  kills: number;
  deaths: number;
  objectives: {
    turrets: number;
    dragons: number;
    barons: number;
  };
  bans: Array<{
    championName: string;
    championImageUrl: string;
  }>;
}

interface GameData {
  players: Player[];
  teams: Team[];
}

export default function LECGameVisualizer() {
  const [seriesId, setSeriesId] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/getSeriesData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId }),
      });
      const data = await response.json();

      // Process the data to fit our GameData interface
      const processedData: GameData = {
        players: data
          .filter((item: any) => item.summoner_name)
          .map((player: any) => ({
            summoner_name: player.summoner_name,
            team_tag: player.team_tag,
            champion: player.champion,
            championImageUrl: player.championImageUrl,
            kills: player.kills,
            deaths: player.deaths,
            assists: player.assists,
            kda: player.kda,
            damageShare: player.damageShare,
            creepScore: player.creepScore,
            wardsPlaced: Math.round(
              player.wardsPlacedPerMinute * (player.game_duration / 60),
            ),
            wardsCleared: Math.round(
              player.wardsClearedPerMinute * (player.game_duration / 60),
            ),
          })),
        teams: data
          .filter((item: any) => item.teamKills)
          .map((team: any) => ({
            team_tag: team.team_tag,
            side: team.side,
            win: team.win,
            kills: team.teamKills,
            deaths: team.teamDeaths,
            objectives: {
              turrets: team.turretKills,
              dragons: team.dragonKills,
              barons: team.baronKills,
            },
            bans: team.bans,
          })),
      };
      setGameData(processedData);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const TeamOverview = ({ team }: { team: Team }) => (
    <Card>
      <CardHeader>
        <CardTitle
          className={team.side === 100 ? "text-blue-600" : "text-red-600"}
        >
          {team.team_tag} ({team.side === 100 ? "Blue Side" : "Red Side"})
        </CardTitle>
        <CardDescription>
          <Badge variant={team.win ? "default" : "destructive"}>
            {team.win ? "Victory" : "Defeat"}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">KDA</p>
            <p className="text-2xl font-bold">
              {team.kills}/{team.deaths}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Objectives</p>
            <div className="flex space-x-2">
              <Badge variant="outline">{team.objectives.turrets} Turrets</Badge>
              <Badge variant="outline">{team.objectives.dragons} Dragons</Badge>
              <Badge variant="outline">{team.objectives.barons} Barons</Badge>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Bans</p>
          <div className="flex space-x-2">
            {team.bans.map((ban, index) => (
              <Avatar key={index} className="h-8 w-8">
                <AvatarImage
                  src={ban.championImageUrl}
                  alt={ban.championName}
                />
                <AvatarFallback>
                  {ban.championName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PlayerTable = ({ players }: { players: Player[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Champion</TableHead>
          <TableHead>KDA</TableHead>
          <TableHead>DMG Share</TableHead>
          <TableHead>CS</TableHead>
          <TableHead>Vision</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {player.summoner_name}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={player.championImageUrl}
                    alt={player.champion}
                  />
                  <AvatarFallback>
                    {player.champion.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span>{player.champion}</span>
              </div>
            </TableCell>
            <TableCell>
              {player.kills}/{player.deaths}/{player.assists}
            </TableCell>
            <TableCell>{(player.damageShare * 100).toFixed(1)}%</TableCell>
            <TableCell>{player.creepScore}</TableCell>
            <TableCell>
              {player.wardsPlaced}/{player.wardsCleared}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>LEC Game Visualizer</CardTitle>
          <CardDescription>
            Enter a series ID to fetch and display game data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Series ID"
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
            />
            <Button onClick={fetchGameData} disabled={loading}>
              {loading ? "Loading..." : "Fetch Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {gameData && (
        <Card>
          <CardHeader>
            <CardTitle>Game Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="blue">Blue Team</TabsTrigger>
                <TabsTrigger value="red">Red Team</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {gameData.teams && (
                    <>
                      <TeamOverview team={gameData.teams[0]!} />
                      <TeamOverview team={gameData.teams[1]!} />
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="blue">
                <PlayerTable
                  players={gameData.players.filter(
                    (p) =>
                      gameData.teams &&
                      p.team_tag === gameData.teams[0]?.team_tag,
                  )}
                />
              </TabsContent>
              <TabsContent value="red">
                <PlayerTable
                  players={gameData.players.filter(
                    (p) =>
                      gameData.teams &&
                      p.team_tag === gameData.teams[1]?.team_tag,
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
