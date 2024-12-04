import { useState } from "react";
import { ScrimGame, useScrimStore } from "~/store/scrim-store";
import { Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { SeriesDataResponse } from "~/types/api";

interface SeriesFormProps {
  blockId: string;
  className?: string;
}

const SeriesForm = ({ blockId, className = "" }: SeriesFormProps) => {
  const [seriesId, setSeriesId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setBlockLoading, addGameToBlock } = useScrimStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBlockLoading(blockId, true);

    try {
      const res = await fetch("/api/getSeriesData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seriesId }),
      });

      const data: SeriesDataResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch game data");
      }

      const seriesData = JSON.parse(data.output);

      // Format the game data to match ScrimGame interface
      const gameData: ScrimGame = {
        ...seriesData.game,
        players: seriesData.players,
        objectives: seriesData.objectives,
        bans: seriesData.bans,
      };

      addGameToBlock(blockId, gameData);

      toast({
        title: "Success",
        description: data.message || "Game data has been added successfully.",
      });

      setSeriesId("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setBlockLoading(blockId, false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
          placeholder="Enter Series ID"
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !seriesId}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Game"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SeriesForm;
