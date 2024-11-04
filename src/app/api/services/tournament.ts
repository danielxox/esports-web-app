// services/tournaments.ts
import { db } from "~/server/db"; // Adjust the path based on your project structure
import { tournaments } from "~/server/db/schema"; // Import the tournaments table

export async function getTournaments() {
  return await db.select().from(tournaments);
}
