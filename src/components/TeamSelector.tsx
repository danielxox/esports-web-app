import { useState } from "react";
import { Team } from "~/types/team";
import { LEC_TEAMS } from "~/data/teams";
import { useScrimStore } from "~/store/scrim-store";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface TeamSelectorProps {
  onTeamSelect: (team: Team) => void;
  selectedTeam?: Team | null;
  customTeams: Team[];
  onCustomTeamAdd?: (team: Team) => void;
}

export const TeamSelector = ({
  onTeamSelect,
  selectedTeam,
  customTeams,
  onCustomTeamAdd,
}: TeamSelectorProps) => {
  const { removeCustomTeam } = useScrimStore();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTeamName, setCustomTeamName] = useState("");

  const allTeams = [...LEC_TEAMS, ...customTeams];

  const handleCustomTeamAdd = () => {
    if (customTeamName.trim()) {
      const newTeam: Team = {
        id: customTeamName.toLowerCase().replace(/\s+/g, "-"),
        name: customTeamName,
        shortName: customTeamName.substring(0, 3).toUpperCase(),
        logoUrl: "/team-logos/default.webp",
        isLEC: false,
      };
      onCustomTeamAdd?.(newTeam);
      setCustomTeamName("");
      setShowCustomInput(false);
    }
  };

  const handleDeleteTeam = (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeCustomTeam(teamId);
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedTeam?.id}
        onValueChange={(value) => {
          if (value === "custom") {
            setShowCustomInput(true);
          } else {
            const team = allTeams.find((t) => t.id === value);
            if (team) onTeamSelect(team);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select opponent team">
            {selectedTeam && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                  />
                  <AvatarFallback>{selectedTeam.shortName}</AvatarFallback>
                </Avatar>
                {selectedTeam.name}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>LEC Teams</SelectLabel>
            {LEC_TEAMS.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={team.logoUrl} alt={team.name} />
                    <AvatarFallback>{team.shortName}</AvatarFallback>
                  </Avatar>
                  {team.name}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          {customTeams.length > 0 && (
            <SelectGroup>
              <SelectLabel>Other Teams</SelectLabel>
              {customTeams.map((team) => (
                <div key={team.id} className="relative">
                  <SelectItem value={team.id}>
                    <div className="flex items-center gap-2 pr-8">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.logoUrl} alt={team.name} />
                        <AvatarFallback>{team.shortName}</AvatarFallback>
                      </Avatar>
                      {team.name}
                    </div>
                  </SelectItem>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-destructive/10"
                    onClick={(e) => handleDeleteTeam(e, team.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </SelectGroup>
          )}
          <SelectGroup>
            <SelectItem value="custom">+ Add Custom Team</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {showCustomInput && (
        <div className="flex gap-2">
          <Input
            value={customTeamName}
            onChange={(e) => setCustomTeamName(e.target.value)}
            placeholder="Enter team name"
          />
          <Button
            onClick={handleCustomTeamAdd}
            disabled={!customTeamName.trim()}
          >
            Add
          </Button>
          <Button variant="outline" onClick={() => setShowCustomInput(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamSelector;
