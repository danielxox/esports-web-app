"use client";

import { useState } from "react";
import { useScrimStore } from "~/store/scrim-store";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TeamSelector } from "~/components/TeamSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import ScrimBlock from "~/components/ScrimBlock";
import { Team } from "~/types/team";
import { useHasAccess } from "~/hooks/useHasAccess";

interface NewScrimData {
  team2: Team | null;
  date: string;
  startTime: string;
  notes: string;
}

// Helper function that guarantees a string date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function LeaguePage() {
  const { hasAnalystAccess, getUserRoles } = useHasAccess();
  const {
    scrimBlocks,
    selectedPatch,
    setSelectedPatch,
    getAvailablePatches,
    getFilteredBlocks,
    addScrimBlock,
    customTeams,
    addCustomTeam,
  } = useScrimStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScrimData, setNewScrimData] = useState<NewScrimData>({
    team2: null,
    date: getTodayDate(),
    startTime: "13:00",
    notes: "",
  });

  const patches = getAvailablePatches();
  const filteredBlocks = getFilteredBlocks();

  const handleCreateScrim = () => {
    if (!newScrimData.team2) return;

    addScrimBlock({
      date: newScrimData.date,
      startTime: newScrimData.startTime,
      team2: newScrimData.team2,
      notes: newScrimData.notes,
    });

    setIsDialogOpen(false);
    setNewScrimData({
      team2: null,
      date: getTodayDate(),
      startTime: "13:00",
      notes: "",
    });
  };

  const sortedBlocks = filteredBlocks.sort((a, b) => {
    // First compare by date
    const dateComparison =
      new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;

    // Then by time if dates are equal
    return b.startTime.localeCompare(a.startTime);
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scrims</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="patch-filter">Patch:</Label>
            <Select value={selectedPatch} onValueChange={setSelectedPatch}>
              <SelectTrigger className="w-[180px]" id="patch-filter">
                <SelectValue placeholder="Select patch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patches</SelectItem>
                {patches.map((patch) => (
                  <SelectItem key={patch} value={patch}>
                    Patch {patch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasAnalystAccess() && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Scrim Block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scrim Block</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new scrim block.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Opponent Team</Label>
                    <TeamSelector
                      onTeamSelect={(team) =>
                        setNewScrimData((prev) => ({
                          ...prev,
                          team2: team,
                        }))
                      }
                      selectedTeam={newScrimData.team2}
                      customTeams={customTeams}
                      onCustomTeamAdd={addCustomTeam}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newScrimData.date}
                        onChange={(e) =>
                          setNewScrimData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="time">Start Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newScrimData.startTime}
                        onChange={(e) =>
                          setNewScrimData((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newScrimData.notes}
                      onChange={(e) =>
                        setNewScrimData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateScrim}
                  disabled={
                    !newScrimData.team2 ||
                    !newScrimData.date ||
                    !newScrimData.startTime
                  }
                >
                  Create Scrim Block
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {sortedBlocks.map((block) => (
          <ScrimBlock key={block.id} blockId={block.id} />
        ))}
      </div>
    </div>
  );
}
