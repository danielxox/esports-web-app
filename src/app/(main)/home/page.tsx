import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

// Mock data - replace with your actual data source
const updates = [
  {
    id: 1,
    title: "New Project Management Features Released",
    content:
      "We've just launched several new features to improve project tracking and team collaboration. These include custom dashboards, enhanced reporting, and real-time notifications.",
    author: {
      name: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      initials: "SJ",
    },
    category: "Feature Update",
    timestamp: "2024-10-30T09:00:00Z",
  },
  {
    id: 2,
    title: "Team Meeting Schedule Changes",
    content:
      "Starting next week, our daily standups will move to 10 AM EST to better accommodate team members across different time zones.",
    author: {
      name: "Mike Chen",
      avatar: "/api/placeholder/32/32",
      initials: "MC",
    },
    category: "Announcement",
    timestamp: "2024-10-29T15:30:00Z",
  },
  {
    id: 3,
    title: "Q4 Goals Overview",
    content:
      "Review of our key objectives for Q4 2024 and progress updates on our main initiatives. Click to see the detailed breakdown.",
    author: {
      name: "Alex Rivera",
      avatar: "/api/placeholder/32/32",
      initials: "AR",
    },
    category: "Goals",
    timestamp: "2024-10-28T11:15:00Z",
  },
];

export default function HomePage() {
  // Function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Team Updates</h1>
            <span className="block text-muted-foreground">
              Stay up to date with the latest news and announcements
            </span>
          </div>
        </div>

        {/* Carousel Section */}
        <Carousel className="my-4">
          <CarouselContent>
            <CarouselItem>
              <div className="rounded-xl bg-zinc-800 p-6 text-white">
                Next Scrim: vs G2 Esports - Meeting at 12:30
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="rounded-xl bg-zinc-800 p-6 text-white">
                Tomorrows Lunch: Chicken with Rice!
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="rounded-xl bg-zinc-800 p-6 text-white">
                Quote of the Day: Keep the Kitchen clean ;D
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Updates Feed */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {updates.map((update) => (
              <Card
                key={update.id}
                className="transition-colors hover:bg-accent/5"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{update.title}</CardTitle>
                      <CardDescription className="flex flex-row items-center gap-2">
                        <span className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={update.author.avatar}
                              alt={update.author.name}
                            />
                            <AvatarFallback>
                              {update.author.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{update.author.name}</span>
                        </span>
                        <span>•</span>
                        <span>{formatDate(update.timestamp)}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{update.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="block text-muted-foreground">
                    {update.content}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
