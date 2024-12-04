// types/game.ts
export interface Game {
  platformGameId: string;
  tournament: string;
  tournamentId?: string; // Optional for compatibility
  gameDuration: number;
  winnerSide: number;
  gameDate: string;
  blueTeam: string;
  redTeam: string;
  patch?: string;
}

export interface Player {
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
  role: string;
}

export interface Objective {
  platformGameId: string;
  teamTag: string;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
}

export interface Ban {
  platformGameId: string;
  teamTag: string;
  championName: string;
  pickTurn: number;
}

export interface SeriesData {
  game: Game;
  players: Player[];
  objectives: Objective[];
  bans: Ban[];
}
