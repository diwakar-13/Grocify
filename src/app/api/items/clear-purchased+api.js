import { clearPurchasedItems } from "@/lib/server/db-action";

function getUserId(request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader) return null;
  try {
    const base64Url = authHeader.replace("Bearer ", "").split('.')[1];
    return JSON.parse(Buffer.from(base64Url.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()).sub;
  } catch (e) { return null; }
}

export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await clearPurchasedItems(userId);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}