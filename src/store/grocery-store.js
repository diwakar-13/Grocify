import { create } from "zustand";

export const useGroceryStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/items");
      const payload = await res.json();
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      set({ items: payload.items });
    } catch (error) {
      console.error("Error loading items:", error);
      set({ error: "Something went wrong" });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (input) => {
    set({ error: null });
    // Temporary ID real-time UI render ke liye jab tak DB response na de
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      name: input.name,
      category: input.category,
      quantity: Math.max(1, input.quantity),
      priority: input.priority,
      purchased: false,
    };

    // ⚡ INSTANT UI UPDATE
    const previousItems = get().items;
    set({ items: [optimisticItem, ...previousItems] });

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          category: input.category,
          quantity: Math.max(1, input.quantity),
          priority: input.priority,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      // Real DB entry se temporary item ko replace karein
      set((state) => ({
        items: state.items.map((item) =>
          item.id === tempId ? payload.item : item,
        ),
      }));
      return payload.item;
    } catch (error) {
      console.error("Error adding item:", error);
      set({ items: previousItems, error: "Failed to add item" }); // Rollback
    }
  },

  updateQuantity: async (id, quantity) => {
    const nextQuantity = Math.max(1, quantity);
    set({ error: null });

    const previousItems = get().items;

    // ⚡ INSTANT QUANTITY UPDATE IN UI
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item,
      ),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQuantity }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const payload = await res.json();
     
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? payload.item : item,
        ),
      }));
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ items: previousItems, error: "Failed to update quantity" }); 
    }
  },

  togglePurchased: async (id) => {
    set({ error: null });
    const previousItems = get().items;
    const currentItem = previousItems.find((item) => item.id === id);
    if (!currentItem) return;

    const nextPurchased = !currentItem.purchased;

    // ⚡ INSTANT CHECKBOX/PURCHASED TOGGLE
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, purchased: nextPurchased } : item,
      ),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased: nextPurchased }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const payload = await res.json();
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? payload.item : item,
        ),
      }));
    } catch (error) {
      console.error("Error toggling purchased:", error);
      set({ items: previousItems, error: "Failed to update status" }); // Rollback
    }
  },

  removeItem: async (id) => {
    set({ error: null });
    const previousItems = get().items;

    // ⚡ INSTANT REMOVE FROM UI
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (error) {
      console.error("Error removing item:", error);
      set({ items: previousItems, error: "Failed to remove item" }); // Rollback
    }
  },

  clearPurchased: async () => {
    set({ error: null });
    const previousItems = get().items;

    // ⚡ INSTANT UI CLEAR
    set({ items: previousItems.filter((item) => !item.purchased) });

    try {
      const res = await fetch("/api/items/clear-purchased", { method: "POST" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (error) {
      console.error("Error clearing purchased:", error);
      set({ items: previousItems, error: "Failed to clear items" }); // Rollback
    }
  },
}));
