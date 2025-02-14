import React from "react";
import { Calendar } from "~/components/ui/calendar";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Meal {
  id: number;
  date: Date;
  name: string;
  type: "lunch" | "dinner";
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Updated meal data to only include lunch and dinner options
const getMeals = (): Meal[] => [
  {
    id: 1,
    date: new Date(2023, 9, 15),
    name: "Pre-game Power Lunch",
    type: "lunch",
    description:
      "High-protein meal with grilled chicken, quinoa, and mixed vegetables",
    calories: 650,
    protein: 40,
    carbs: 70,
    fat: 20,
  },
  {
    id: 2,
    date: new Date(2023, 9, 15),
    name: "Recovery Dinner",
    type: "dinner",
    description: "Salmon with sweet potato mash and steamed broccoli",
    calories: 550,
    protein: 35,
    carbs: 50,
    fat: 25,
  },
  {
    id: 4,
    date: new Date(2023, 9, 16),
    name: "Focus-Enhancing Lunch",
    type: "lunch",
    description: "Grilled beef stir-fry with brown rice and mixed vegetables",
    calories: 550,
    protein: 25,
    carbs: 75,
    fat: 20,
  },
];

export default function FoodPage() {
  const meals = getMeals();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-4xl font-bold">Esports Team Meal Planner</h1>
      <p className="mb-8 text-xl text-muted-foreground">
        Savor our curated lunch and dinner options designed for peak
        performance.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Meal listings */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="lunch" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
            <TabsContent value="lunch">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                {meals
                  .filter((meal) => meal.type === "lunch")
                  .map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="dinner">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                {meals
                  .filter((meal) => meal.type === "dinner")
                  .map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Calendar sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Meal Calendar</CardTitle>
              <CardDescription>Upcoming Lunch &amp; Dinner</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{meal.name}</CardTitle>
          <Badge variant="outline">{meal.date.toLocaleDateString()}</Badge>
        </div>
        <CardDescription>{meal.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Calories:</strong> {meal.calories}
          </div>
          <div>
            <strong>Protein:</strong> {meal.protein}g
          </div>
          <div>
            <strong>Carbs:</strong> {meal.carbs}g
          </div>
          <div>
            <strong>Fat:</strong> {meal.fat}g
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
