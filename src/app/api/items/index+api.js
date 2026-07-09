import { createGroceryItem, listGroceryItems } from "@/lib/server/db-action";

function getUserId(request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString());
    return payload.sub; // 🔑 'sub' hi Clerk ki unique userId hoti hai
  } catch (e) {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const items = await listGroceryItems(userId);
    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, category, quantity, priority } = body;

    if (!name || !category || !priority) {
      return Response.json(
        { error: "Please provide all required fields." },
        { status: 400 },
      );
    }

    const item = await createGroceryItem(
      { name, category, quantity, priority },
      userId,
    );
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
