import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  parseISO,
} from "date-fns";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { type ScrimBlock } from "~/store/scrim-store";

interface CategorizedBlocks {
  today: ScrimBlock[];
  tomorrow: ScrimBlock[];
  thisWeek: ScrimBlock[];
  thisMonth: ScrimBlock[];
  future: ScrimBlock[];
}

interface ScrimSectionProps {
  title: string;
  blocks: ScrimBlock[];
  indicator: React.ReactNode;
}

interface EnhancedScrimListingProps {
  blocks: ScrimBlock[];
}

const ScrimSection: React.FC<ScrimSectionProps> = ({
  title,
  blocks,
  indicator,
}) => {
  if (blocks.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              {indicator}
              {title}
            </div>
          </CardTitle>
          <Badge variant="secondary">{blocks.length} scrims</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/5"
            >
              <div className="flex min-w-[120px] flex-col">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(block.date), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(parseISO(`2000-01-01T${block.startTime}`), "h:mm a")}
                </div>
              </div>

              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden rounded-full">
                    {block.team2.logoUrl ? (
                      <img
                        src={block.team2.logoUrl}
                        alt={block.team2.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 font-medium">
                        {block.team2.shortName || block.team2.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{block.team2.name}</div>
                    {block.notes && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        {block.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const EnhancedScrimListing: React.FC<EnhancedScrimListingProps> = ({
  blocks,
}) => {
  const categorizeBlocks = (blocks: ScrimBlock[]): CategorizedBlocks => {
    const today: ScrimBlock[] = [];
    const tomorrow: ScrimBlock[] = [];
    const thisWeek: ScrimBlock[] = [];
    const thisMonth: ScrimBlock[] = [];
    const future: ScrimBlock[] = [];

    blocks.forEach((block) => {
      const date = parseISO(block.date);
      if (isToday(date)) {
        today.push(block);
      } else if (isTomorrow(date)) {
        tomorrow.push(block);
      } else if (isThisWeek(date)) {
        thisWeek.push(block);
      } else if (isThisMonth(date)) {
        thisMonth.push(block);
      } else {
        future.push(block);
      }
    });

    return { today, tomorrow, thisWeek, thisMonth, future };
  };

  const categorizedBlocks = categorizeBlocks(blocks);

  return (
    <div className="space-y-2">
      <ScrimSection
        title="Today's Scrims"
        blocks={categorizedBlocks.today}
        indicator={<Badge variant="default">Today</Badge>}
      />
      <ScrimSection
        title="Tomorrow's Scrims"
        blocks={categorizedBlocks.tomorrow}
        indicator={<Badge>Tomorrow</Badge>}
      />
      <ScrimSection
        title="This Week's Scrims"
        blocks={categorizedBlocks.thisWeek}
        indicator={<Badge variant="secondary">This Week</Badge>}
      />
      <ScrimSection
        title="This Month's Scrims"
        blocks={categorizedBlocks.thisMonth}
        indicator={<Badge variant="outline">This Month</Badge>}
      />
      <ScrimSection
        title="Future Scrims"
        blocks={categorizedBlocks.future}
        indicator={<Badge variant="outline">Upcoming</Badge>}
      />
    </div>
  );
};

export default EnhancedScrimListing;
