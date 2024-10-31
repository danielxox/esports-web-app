import React from "react";
import { Calendar } from "~/components/ui/calendar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface Meal {
  id: number;
  date: Date;
  name: string;
  type: string;
  description: string;
  chef: string;
  dietary: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionItemProps {
  icon: string;
  label: string;
  description: string;
}

// This is a mock function to simulate fetching meal data
const getMeals = (): Meal[] => [
  {
    id: 1,
    date: new Date(2023, 9, 15),
    name: "Pre-game Power Lunch",
    type: "lunch",
    description:
      "High-protein meal with grilled chicken, quinoa, and mixed vegetables",
    chef: "Chef Alex",
    dietary: ["High Protein", "Balanced"],
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
    chef: "Chef Sam",
    dietary: ["Omega-3 Rich", "Anti-inflammatory"],
    calories: 550,
    protein: 35,
    carbs: 50,
    fat: 25,
  },
  {
    id: 3,
    date: new Date(2023, 9, 16),
    name: "Energy Boost Breakfast",
    type: "breakfast",
    description: "Oatmeal with fresh berries, nuts, and a side of Greek yogurt",
    chef: "Chef Jamie",
    dietary: ["High Fiber", "Antioxidants"],
    calories: 450,
    protein: 20,
    carbs: 60,
    fat: 15,
  },
  {
    id: 4,
    date: new Date(2023, 9, 16),
    name: "Focus-Enhancing Lunch",
    type: "lunch",
    description: "Grilled tofu stir-fry with brown rice and mixed vegetables",
    chef: "Chef Alex",
    dietary: ["Plant-based", "Brain Food"],
    calories: 550,
    protein: 25,
    carbs: 75,
    fat: 20,
  },
  {
    id: 5,
    date: new Date(2023, 9, 17),
    name: "Pre-Tournament Breakfast",
    type: "breakfast",
    description: "Whole grain pancakes with fresh fruit and turkey bacon",
    chef: "Chef Sam",
    dietary: ["Balanced", "Energy-boosting"],
    calories: 600,
    protein: 30,
    carbs: 80,
    fat: 20,
  },
];

export default function FoodPage() {
  const meals = getMeals();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-4xl font-bold">Esports Team Meal Planner</h1>
      <p className="mb-8 text-xl text-muted-foreground">
        Stay fueled and focused with our carefully crafted meals
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Meals</TabsTrigger>
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </ScrollArea>
            </TabsContent>
            {["breakfast", "lunch", "dinner"].map((mealType) => (
              <TabsContent key={mealType} value={mealType}>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                  {meals
                    .filter((meal) => meal.type === mealType)
                    .map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Meal Calendar</CardTitle>
              <CardDescription>View upcoming meals</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Nutritional Focus</CardTitle>
              <CardDescription>Key elements in our meal plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <NutritionItem
                  icon="🏋️"
                  label="High Protein"
                  description="Muscle Recovery & Growth"
                />
                <NutritionItem
                  icon="🧠"
                  label="Omega-3 Rich"
                  description="Cognitive Function"
                />
                <NutritionItem
                  icon="⚡"
                  label="High Energy"
                  description="Sustained Performance"
                />
              </ul>
            </CardContent>
          </Card>

          <Alert className="mt-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Dietary Restrictions?</AlertTitle>
            <AlertDescription>
              Please inform our chefs of any allergies or dietary requirements.
              We're happy to accommodate your needs!
            </AlertDescription>
          </Alert>
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
        <Accordion type="single" collapsible>
          <AccordionItem value="nutritional-info">
            <AccordionTrigger>Nutritional Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                <div>Calories: {meal.calories}</div>
                <div>Protein: {meal.protein}g</div>
                <div>Carbs: {meal.carbs}g</div>
                <div>Fat: {meal.fat}g</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Chef: {meal.chef}</div>
        <div className="flex space-x-2">
          {meal.dietary.map((diet, index) => (
            <Badge key={index} variant="secondary">
              {diet}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

function NutritionItem({ icon, label, description }: NutritionItemProps) {
  return (
    <li className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span>{description}</span>
    </li>
  );
}
