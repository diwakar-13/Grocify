import {
  deleteGroceryItem,
  setGroceryItemPurchased,
  updateGroceryItemQuantity,
} from "@/lib/server/db-action";

function getUserId(request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (!authHeader) return null;
  try {
    const base64Url = authHeader.replace("Bearer ", "").split(".")[1];
    return JSON.parse(
      Buffer.from(
        base64Url.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString(),
    ).sub;
  } catch (e) {
    return null;
  }
}

export async function PATCH(request, { id }) {
  try {
    const userId = getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const item = body.quantity
      ? await updateGroceryItemQuantity(id, body.quantity, userId)
      : await setGroceryItemPurchased(id, body.purchased ?? true, userId);

    if (!item)
      return Response.json(
        { error: "Item not found or access denied." },
        { status: 404 },
      );

    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { id }) {
  try {
    const userId = getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await deleteGroceryItem(id, userId);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
