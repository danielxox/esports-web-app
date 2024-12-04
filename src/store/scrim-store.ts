import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import { Game, Player, Objective, Ban } from "~/types/game";
import { Team } from "~/types/team";
import { ROGUE_TEAM } from "~/data/teams";

export interface ScrimGame extends Game {
  players: Player[];
  objectives: Objective[];
  bans: Ban[];
  patch?: string;
}

export interface ScrimBlock {
  id: string;
  date: string;
  startTime: string;
  team1: Team;
  team2: Team;
  notes?: string;
  games: ScrimGame[];
  isLoading?: boolean;
}

export interface NewScrimBlockData {
  date: string;
  startTime: string;
  team2: Team;
  notes?: string;
}

interface ScrimStore {
  scrimBlocks: ScrimBlock[];
  customTeams: Team[];
  selectedPatch: string;
  _hasHydrated: boolean;
  addScrimBlock: (block: NewScrimBlockData) => void;
  updateScrimBlock: (id: string, block: Partial<ScrimBlock>) => void;
  deleteScrimBlock: (id: string) => void;
  addGameToBlock: (blockId: string, game: ScrimGame) => void;
  setBlockLoading: (blockId: string, isLoading: boolean) => void;
  setSelectedPatch: (patch: string) => void;
  addCustomTeam: (team: Team) => void;
  getFilteredBlocks: () => ScrimBlock[];
  getAvailablePatches: () => string[];
  setHasHydrated: (state: boolean) => void;
  removeCustomTeam: (teamId: string) => void;
}

const initialState = {
  scrimBlocks: [],
  customTeams: [],
  selectedPatch: "all",
  _hasHydrated: false,
};

const persistOptions: PersistOptions<ScrimStore> = {
  name: "scrim-storage",
  storage: createJSONStorage(() => localStorage),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.setHasHydrated(true);
    }
  },
};

export const useScrimStore = create<ScrimStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      removeCustomTeam: (teamId: string) =>
        set((state) => ({
          customTeams: state.customTeams.filter((team) => team.id !== teamId),
        })),

      addScrimBlock: (block: NewScrimBlockData) =>
        set((state) => ({
          scrimBlocks: [
            ...state.scrimBlocks,
            {
              id: crypto.randomUUID(),
              date: block.date,
              startTime: block.startTime,
              team1: ROGUE_TEAM,
              team2: block.team2,
              notes: block.notes,
              games: [],
              isLoading: false,
            },
          ],
        })),

      updateScrimBlock: (id: string, block: Partial<ScrimBlock>) =>
        set((state) => ({
          scrimBlocks: state.scrimBlocks.map((b) =>
            b.id === id ? { ...b, ...block } : b,
          ),
        })),

      deleteScrimBlock: (id: string) =>
        set((state) => ({
          scrimBlocks: state.scrimBlocks.filter((b) => b.id !== id),
        })),

      addGameToBlock: (blockId: string, game: ScrimGame) =>
        set((state) => ({
          scrimBlocks: state.scrimBlocks.map((b) =>
            b.id === blockId ? { ...b, games: [...(b.games || []), game] } : b,
          ),
        })),

      setBlockLoading: (blockId: string, isLoading: boolean) =>
        set((state) => ({
          scrimBlocks: state.scrimBlocks.map((b) =>
            b.id === blockId ? { ...b, isLoading } : b,
          ),
        })),

      setSelectedPatch: (patch: string) => set({ selectedPatch: patch }),

      addCustomTeam: (team: Team) =>
        set((state) => ({
          customTeams: [...state.customTeams, team],
        })),

      getFilteredBlocks: () => {
        const { scrimBlocks, selectedPatch } = get();
        if (selectedPatch === "all") return scrimBlocks;

        return scrimBlocks.filter((block) =>
          block.games.some((game) => game.patch === selectedPatch),
        );
      },

      getAvailablePatches: () => {
        const { scrimBlocks } = get();
        const patches = new Set<string>();

        scrimBlocks.forEach((block) => {
          block.games.forEach((game) => {
            if (game.patch) patches.add(game.patch);
          });
        });

        return Array.from(patches).sort((a, b) => {
          const [aMajorStr = "0", aMinorStr = "0"] = a.split(".");
          const [bMajorStr = "0", bMinorStr = "0"] = b.split(".");

          const aMajor = parseInt(aMajorStr) || 0;
          const aMinor = parseInt(aMinorStr) || 0;
          const bMajor = parseInt(bMajorStr) || 0;
          const bMinor = parseInt(bMinorStr) || 0;

          if (aMajor !== bMajor) return bMajor - aMajor;
          return bMinor - aMinor;
        });
      },
    }),
    persistOptions,
  ),
);
