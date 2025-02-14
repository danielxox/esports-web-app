"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Define a type for news items
type NewsItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  author_avatar: string;
  author_name: string;
  created_at: string;
};

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleAddNews = async () => {
    if (!newTitle || !newContent) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setNews([newItem, ...news]);
        setShowDialog(false);
        setNewTitle("");
        setNewContent("");
        setNewCategory("");
      }
    } catch (error) {
      console.error("Failed to add news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Updates</h1>
        <Button onClick={() => setShowDialog(true)}>+ Add News</Button>
      </div>

      {/* Add News Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add News</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
          />
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Content"
          />
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category (optional)"
          />
          <DialogFooter>
            <Button disabled={loading} onClick={handleAddNews}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* News Feed */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {news.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No news available.
            </p>
          ) : (
            news.map((item) => (
              <Card
                key={item.id}
                className="transition-colors hover:bg-accent/5"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={item.author_avatar}
                            alt={item.author_name}
                          />
                          <AvatarFallback>{item.author_name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{item.author_name}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{item.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
