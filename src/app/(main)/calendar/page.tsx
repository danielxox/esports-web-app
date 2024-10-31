"use client";

import * as React from "react";
import { Calendar } from "~/components/ui/calendar";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { DayContent, DayContentProps } from "react-day-picker";

type Event = {
  id: string;
  title: string;
  date: Date;
  type: "scrim" | "league" | "content" | "other";
};

const events: Event[] = [
  {
    id: "1",
    title: "Scrim vs Team A",
    date: new Date(2024, 9, 5),
    type: "scrim",
  },
  {
    id: "2",
    title: "League Game vs Team B",
    date: new Date(2024, 9, 10),
    type: "league",
  },
  {
    id: "3",
    title: "Video Shoot",
    date: new Date(2024, 9, 15),
    type: "content",
  },
  {
    id: "4",
    title: "Team Meeting",
    date: new Date(2024, 9, 20),
    type: "other",
  },
];

const EventCard = ({ event }: { event: Event }) => (
  <div className="mb-4 rounded-lg bg-white p-4 shadow-md">
    <h3 className="mb-2 text-lg font-semibold">{event.title}</h3>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        {event.date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <Badge
        variant={
          event.type === "scrim"
            ? "default"
            : event.type === "league"
              ? "destructive"
              : event.type === "content"
                ? "secondary"
                : "outline"
        }
      >
        {event.type}
      </Badge>
    </div>
  </div>
);

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );

  const DayComponent = React.useCallback(
    (props: DayContentProps) => {
      const eventForDay = events.find(
        (event) => event.date.toDateString() === props.date.toDateString(),
      );

      return (
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "relative h-9 w-9 p-0 font-normal",
                selectedDate &&
                  props.date.toDateString() === selectedDate.toDateString() &&
                  "bg-primary text-primary-foreground",
                "aria-selected:opacity-100",
              )}
            >
              <DayContent {...props} />
              {eventForDay && (
                <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-blue-500" />
              )}
            </div>
          </PopoverTrigger>
          {eventForDay && (
            <PopoverContent className="w-64 p-0">
              <EventCard event={eventForDay} />
            </PopoverContent>
          )}
        </Popover>
      );
    },
    [selectedDate],
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold">Team Calendar</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              components={{
                DayContent: DayComponent,
              }}
            />
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Upcoming Events</h2>
          <div className="space-y-4">
            {events
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
