import { Team } from "./team";
import { Game, Player, Objective, Ban } from "./game";

export interface ScrimBlock {
  id: string;
  date: string;
  startTime: string;
  team1: Team;
  team2: Team;
  notes?: string;
  games?: ScrimGame[];
  isLoading?: boolean;
}

export interface ScrimGame extends Game {
  players: Player[];
  objectives: Objective[];
  bans: Ban[];
}
