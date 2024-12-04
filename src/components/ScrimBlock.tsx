// ScrimBlock.tsx
import { useState } from "react";
import {
  useScrimStore,
  type ScrimBlock as ScrimBlockType,
} from "~/store/scrim-store";
import { Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { format } from "date-fns";
import SeriesForm from "./SeriesForm";
import GameDetails from "./GameDetails";

interface ScrimBlockProps {
  blockId: string;
}

const ScrimBlock = ({ blockId }: ScrimBlockProps) => {
  const { scrimBlocks, updateScrimBlock, deleteScrimBlock } = useScrimStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const block = scrimBlocks.find((b) => b.id === blockId);

  if (!block) {
    return null;
  }

  const gameCount = block.games?.length || 0;
  const hasGames = gameCount > 0;

  const handleDelete = () => {
    deleteScrimBlock(block.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="mb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <ChevronDown
                    className={`h-4 w-4 transition-all duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={block.team1.logoUrl}
                          alt={block.team1.name}
                          className="object-contain"
                        />
                        <AvatarFallback>{block.team1.shortName}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {block.team1.shortName}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-500">vs</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={block.team2.logoUrl}
                          alt={block.team2.name}
                          className="object-contain"
                        />
                        <AvatarFallback>{block.team2.shortName}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {block.team2.shortName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {hasGames && (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {gameCount} {gameCount === 1 ? "game" : "games"}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{format(new Date(block.date), "PPP")}</span>
                  <span>•</span>
                  <span>{block.startTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    updateScrimBlock(block.id, block);
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full rounded-md border p-2"
                    value={block.notes || ""}
                    onChange={(e) =>
                      updateScrimBlock(block.id, {
                        ...block,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Add notes..."
                  />
                </div>
              ) : (
                <>
                  {block.notes && (
                    <p className="mb-4 text-sm text-muted-foreground">
                      {block.notes}
                    </p>
                  )}

                  {block.isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {(block.games || []).map((game, index) => (
                        <AccordionItem
                          key={game?.platformGameId || index}
                          value={game?.platformGameId || `game-${index}`}
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full items-center justify-between px-4">
                              <span>Game {index + 1}</span>
                              {game?.gameDuration && (
                                <span className="text-sm text-muted-foreground">
                                  Duration: {Math.floor(game.gameDuration / 60)}
                                  :
                                  {(game.gameDuration % 60)
                                    .toString()
                                    .padStart(2, "0")}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <GameDetails
                              game={game}
                              players={game.players}
                              objectives={game.objectives}
                              bans={game.bans}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter>
              <SeriesForm blockId={block.id} className="w-full" />
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              scrim block and remove all its data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScrimBlock;
