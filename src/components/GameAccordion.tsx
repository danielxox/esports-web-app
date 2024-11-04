// src/components/GameAccordion.tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PlayerStats } from "./PlayerStats";
import { TeamObjectives } from "./TeamObjectives";
import { Bans } from "./Bans";

export function GameAccordion({ game, playerStats, teamObjectives, bans }) {
  const filteredPlayerStats = playerStats.filter(
    (stat) => stat.platformGameId === game.platformGameId,
  );
  const filteredTeamObjectives = teamObjectives.filter(
    (obj) => obj.platformGameId === game.platformGameId,
  );
  const filteredBans = bans.filter(
    (ban) => ban.platformGameId === game.platformGameId,
  );

  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value="game">
        <AccordionTrigger>
          Game ID: {game.platformGameId} | Duration: {game.gameDuration} mins |
          Winner Side: {game.winnerSide}
        </AccordionTrigger>
        <AccordionContent>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {game.gameDate}</p>
              <p>Winner Side: {game.winnerSide}</p>
              <p>Duration: {game.gameDuration} mins</p>
            </CardContent>
          </Card>

          <Accordion type="multiple" collapsible>
            <AccordionItem value="playerStats">
              <AccordionTrigger>Player Stats</AccordionTrigger>
              <AccordionContent>
                <PlayerStats playerStats={filteredPlayerStats} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="teamObjectives">
              <AccordionTrigger>Team Objectives</AccordionTrigger>
              <AccordionContent>
                <TeamObjectives objectives={filteredTeamObjectives} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bans">
              <AccordionTrigger>Bans</AccordionTrigger>
              <AccordionContent>
                <Bans bans={filteredBans} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
