import { create } from "zustand";

interface Game {
  gameId: string;
  players: { team_tag: string }[];
}

interface Scrim {
  id: string;
  name: string;
  date: Date;
  games: Game[];
}

interface Store {
  scrims: Scrim[];
  addScrim: (scrim: Scrim) => void;
  addGame: (scrimId: string, game: Game) => void;
}

const useStore = create<Store>((set) => ({
  scrims: [],
  addScrim: (scrim) => set((state) => ({ scrims: [scrim, ...state.scrims] })),
  addGame: (scrimId, game) =>
    set((state) => ({
      scrims: state.scrims.map((scrim) =>
        scrim.id === scrimId
          ? { ...scrim, games: [...scrim.games, game] }
          : scrim,
      ),
    })),
}));

export default useStore;
