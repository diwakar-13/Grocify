import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { groceryItems } from "./db/schema";

export const listGroceryItems = async (userId) => {
  const rows = await db
    .select()
    .from(groceryItems)
    .where(eq(groceryItems.userId, userId))
    .orderBy(desc(groceryItems.updated_at));

  return rows;
};

export const createGroceryItem = async (input, userId) => {
  const rows = await db
    .insert(groceryItems)
    .values({
      id: crypto.randomUUID(),
      userId: userId,
      name: input.name,
      category: input.category,
      quantity: Math.max(1, input.quantity),
      purchased: false,
      priority: input.priority,
      updated_at: Date.now(),
    })
    .returning();

  return rows[0];
};

export const setGroceryItemPurchased = async (id, purchased, userId) => {
  const rows = await db
    .update(groceryItems)
    .set({
      purchased,
      updated_at: Date.now(),
    })
    .where(and(eq(groceryItems.id, id), eq(groceryItems.userId, userId)))
    .returning();

  if (!rows.length) return null;

  return rows[0];
};

export const updateGroceryItemQuantity = async (id, quantity, userId) => {
  const rows = await db
    .update(groceryItems)
    .set({
      quantity: Math.max(1, Math.floor(quantity)),
      updated_at: Date.now(),
    })
    .where(and(eq(groceryItems.id, id), eq(groceryItems.userId, userId)))
    .returning();

  if (!rows.length) return null;

  return rows[0];
};

export const deleteGroceryItem = async (id, userId) => {
  await db
    .delete(groceryItems)
    .where(and(eq(groceryItems.id, id), eq(groceryItems.userId, userId)));
};

export const clearPurchasedItems = async (userId) => {
  await db
    .delete(groceryItems)
    .where(
      and(eq(groceryItems.purchased, true), eq(groceryItems.userId, userId)),
    );
};
