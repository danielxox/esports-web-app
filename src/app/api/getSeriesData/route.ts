// route.ts
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

    console.log("Processing series:", seriesId);

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

    // Execute Python script
    const { stdout, stderr } = await execAsync(
      `"${pythonPath}" "${scriptPath}" "${seriesId}"`,
    );

    // Log debug output from Python
    if (stderr) {
      console.log("Python debug output:", stderr);
    }

    // If we got no stdout, that's an error
    if (!stdout.trim()) {
      console.error("No output from Python script");
      return NextResponse.json(
        { error: "No data received from script" },
        { status: 500 },
      );
    }

    try {
      // Parse the JSON output
      const gameData = JSON.parse(stdout.trim());

      // Check if Python returned an error
      if (gameData.error) {
        console.error("Python script returned error:", gameData.error);
        return NextResponse.json({ error: gameData.error }, { status: 500 });
      }

      // Return successful response
      return NextResponse.json({
        message: "Successfully fetched game data",
        output: JSON.stringify(gameData),
      });
    } catch (parseError) {
      console.error("Error parsing Python output:", {
        error: parseError,
        stdout: stdout,
        stderr: stderr,
      });

      return NextResponse.json(
        {
          error: "Failed to parse game data",
          details:
            parseError instanceof Error ? parseError.message : "Unknown error",
          debug: {
            stdout: stdout.slice(0, 200), // First 200 chars of output
            stderr: stderr.slice(0, 200), // First 200 chars of stderr
          },
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error executing Python script:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
