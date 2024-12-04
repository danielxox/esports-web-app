import { Game, Player, Objective, Ban } from "./game";

export interface SeriesDataResponse {
  message: string;
  output: string; // This contains the stringified game data
  error?: string;
  details?: string;
}

// The parsed output will match this interface
export interface ParsedSeriesData {
  game: Game;
  players: Player[];
  objectives: Objective[];
  bans: Ban[];
}
