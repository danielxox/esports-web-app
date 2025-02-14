import { NextResponse } from "next/server";
import { db } from "~/server/db"; // Adjust the path based on your project structure
import { news } from "~/server/db/schema"; // Import the news table
import { eq } from "drizzle-orm";
import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { desc } from "drizzle-orm";

// GET: Fetch all news
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req); // Properly extract userId
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.select().from(news).orderBy(desc(news.created_at));
  return NextResponse.json(result);
}

// POST: Create news
export async function POST(req: Request) {
  const authData = await auth();
  const { userId } = authData;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, category } = await req.json();
  if (!title || !content)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Assuming getAuthUserProfile is a valid function to get name and picture
  const { name, picture } = await getAuthUserProfile(userId);

  await db.insert(news).values({
    title,
    content,
    author_id: userId,
    author_name: name,
    author_avatar: picture,
    category,
  });

  return NextResponse.json({ message: "News created" }, { status: 201 });
}

// PUT: Update news
export async function PUT(req: Request) {
  const authData = await auth();
  const { userId } = await authData;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, content, category } = await req.json();
  if (!id || !title || !content)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await db
    .update(news)
    .set({ title, content, category, updated_at: new Date() })
    .where(eq(news.id, id));

  return NextResponse.json({ message: "News updated" });
}

// DELETE: Delete news
export async function DELETE(req: Request) {
  const authData = await auth();
  const { userId } = await authData;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await db.delete(news).where(eq(news.id, id));

  return NextResponse.json({ message: "News deleted" });
}
function getAuthUserProfile(
  userId: string,
): { name: any; picture: any } | PromiseLike<{ name: any; picture: any }> {
  throw new Error("Function not implemented.");
}
