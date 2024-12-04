// ScrimCalendar.tsx
"use client";
import React from "react";
import { useScrimStore, type ScrimBlock } from "~/store/scrim-store";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const ScrimCalendar = () => {
  const { scrimBlocks } = useScrimStore();

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const scrimsByDate = scrimBlocks.reduce<Record<string, ScrimBlock[]>>(
    (acc, scrimBlock) => {
      const date = format(new Date(scrimBlock.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(scrimBlock);
      acc[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return acc;
    },
    {},
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{format(new Date(), "MMMM yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center font-semibold">
              {day}
            </div>
          ))}

          {daysInMonth.map((date) => {
            const dateString = format(date, "yyyy-MM-dd");
            const dayScims = scrimsByDate[dateString] || [];

            return (
              <div
                key={dateString}
                className="min-h-24 rounded-md border p-2 hover:bg-gray-50"
              >
                <div className="font-medium">{format(date, "d")}</div>
                <div className="space-y-1">
                  {dayScims.map((scrim, idx) => (
                    <div
                      key={idx}
                      className="mt-1 rounded bg-blue-100 p-2 text-xs transition-colors hover:bg-blue-200"
                    >
                      <div className="font-medium text-gray-700">
                        {scrim.startTime}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={scrim.team2.logoUrl}
                            alt={scrim.team2.name}
                            className="object-contain"
                          />
                          <AvatarFallback className="text-[10px]">
                            {scrim.team2.shortName}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {scrim.team2.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrimCalendar;
