import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { seriesId } = await request.json();

    if (!seriesId) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 },
      );
    }

    const pythonPath =
      "C:\\Users\\daniel\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "app",
      "api",
      "getSeriesData",
      "api.py",
    );

    const { stdout, stderr } = await execAsync(
      `"${pythonPath}" "${scriptPath}" ${seriesId}`,
    );

    // Log stdout and stderr separately for clarity
    if (stderr) {
      // Only log as an error if it contains specific keywords indicating an actual error
      if (
        stderr.toLowerCase().includes("error") ||
        stderr.toLowerCase().includes("exception")
      ) {
        console.error("Python script error:", stderr);
        return NextResponse.json(
          { error: "Failed to fetch games data", details: stderr.trim() },
          { status: 500 },
        );
      }
      // If there's no actual error, you can still log it for debugging purposes if needed
      console.log("Python script output:", stderr);
    }

    return NextResponse.json({
      message: "Successfully fetched new games data",
      output: stdout.trim(), // Only include stdout in the response
    });
  } catch (error) {
    console.error("Error executing Python script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
