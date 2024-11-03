import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Define the correct script path
const scriptPath = path.join(
  process.cwd(),
  "src",
  "app",
  "api",
  "getSeriesData",
  "api.py",
);

export async function POST(req: Request) {
  const res = NextResponse.json({}); // Create an initial response

  // Parse the incoming request body
  const { seriesId } = await req.json();

  // Validate seriesId
  if (!seriesId) {
    return NextResponse.json(
      { error: "Series ID is required" },
      { status: 400 },
    );
  }

  // Spawn a Python process to run the script
  const pythonProcess = spawn("python", [scriptPath, seriesId]);

  let output = "";
  let errorOutput = "";

  // Collect data from the script's standard output
  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Collect data from the script's standard error
  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python script error output:", data.toString());
  });

  // Handle the close event of the Python process
  return new Promise((resolve) => {
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return resolve(
          NextResponse.json(
            { error: "Python script error", details: errorOutput },
            { status: 500 },
          ),
        );
      }
      resolve(
        NextResponse.json({ message: "Script executed successfully", output }),
      );
    });
  });
}

// If you want to handle other methods, you can export additional named functions
export async function GET(req: Request) {
  // Handle GET request if needed
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
