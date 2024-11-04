// pages/api/tournaments.ts
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db"; // Adjust the path based on your project structure
import { tournaments } from "~/server/db/schema"; // Import the tournaments table

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const tournamentData = await db.select().from(tournaments); // Use imported `tournaments`
    res.status(200).json(tournamentData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournaments" });
  }
}
