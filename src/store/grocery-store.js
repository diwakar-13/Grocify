import { create } from "zustand";

export const useGroceryStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // 🔑 1. Load Items
  loadItems: async (token) => {
    if (!token) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error || `Request failed (${res.status})`);
      set({ items: payload.items || [] });
    } catch (error) {
      console.error("Error loading items:", error);
      set({ error: error.message || "Something went wrong" });
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔑 2. Add Item (Optimistic Update)
  addItem: async (input, token) => {
    if (!token) return;
    set({ error: null });

    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      name: input.name,
      category: input.category,
      quantity: Math.max(1, input.quantity),
      priority: input.priority || "low",
      purchased: false,
    };

    const previousItems = get().items;
    set({ items: [optimisticItem, ...previousItems] });

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: input.name,
          category: input.category,
          quantity: Math.max(1, input.quantity),
          priority: input.priority,
        }),
      });

      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error || `Request failed (${res.status})`);

      set((state) => ({
        items: state.items.map((item) =>
          item.id === tempId ? payload.item : item,
        ),
      }));
      return payload.item;
    } catch (error) {
      console.error("Error adding item:", error);
      set({
        items: previousItems,
        error: error.message || "Failed to add item",
      });
    }
  },

  // 🔑 3. Update Quantity (Optimistic Update)
  updateQuantity: async (id, quantity, token) => {
    if (!token) return;
    const nextQuantity = Math.max(1, quantity);
    set({ error: null });
    const previousItems = get().items;

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item,
      ),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: nextQuantity }),
      });

      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error || `Request failed (${res.status})`);

      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? payload.item : item,
        ),
      }));
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({
        items: previousItems,
        error: error.message || "Failed to update quantity",
      });
    }
  },

  // 🔑 4. Toggle Purchased (Optimistic Update)
  togglePurchased: async (id, token) => {
    if (!token) return;
    set({ error: null });
    const previousItems = get().items;
    const currentItem = previousItems.find((item) => item.id === id);
    if (!currentItem) return;

    const nextPurchased = !currentItem.purchased;

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, purchased: nextPurchased } : item,
      ),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ purchased: nextPurchased }),
      });

      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error || `Request failed (${res.status})`);

      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? payload.item : item,
        ),
      }));
    } catch (error) {
      console.error("Error toggling purchased:", error);
      set({
        items: previousItems,
        error: error.message || "Failed to update status",
      });
    }
  },

  // 🔑 5. Remove Item (Optimistic Update)
  removeItem: async (id, token) => {
    if (!token) return;
    set({ error: null });
    const previousItems = get().items;

    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (error) {
      console.error("Error removing item:", error);
      set({ items: previousItems, error: "Failed to remove item" });
    }
  },

  // 🔑 6. Clear Purchased (Optimistic Update)
  clearPurchased: async (token) => {
    if (!token) return;
    set({ error: null });
    const previousItems = get().items;

    set({ items: previousItems.filter((item) => !item.purchased) });

    try {
      const res = await fetch("/api/items/clear-purchased", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (error) {
      console.error("Error clearing purchased:", error);
      set({ items: previousItems, error: "Failed to clear items" });
    }
  },
}));
