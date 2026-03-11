'use client'

import { useState, useEffect, useCallback } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  price: string; // "" means no price yet
  quantity: number;
  checked: boolean;
}

export interface ShoppingListData {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

const LISTS_KEY = "shopping-lists";
const ACTIVE_KEY = "active-list-id";

function loadLists(): ShoppingListData[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(LISTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLists(lists: ShoppingListData[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLists(loadLists());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveLists(lists);
  }, [isHydrated, lists]);

  const createList = useCallback((name: string): string => {
    const id = genId();
    const newList: ShoppingListData = {
      id,
      name,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLists((prev) => [newList, ...prev]);
    return id;
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { lists, createList, deleteList };
}

export function useActiveList() {
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLists(loadLists());
    setActiveId(loadActiveId());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveLists(lists);
  }, [isHydrated, lists]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    if (activeId) window.localStorage.setItem(ACTIVE_KEY, activeId);
    else window.localStorage.removeItem(ACTIVE_KEY);
  }, [isHydrated, activeId]);

  // Auto-create a list if none exists
  useEffect(() => {
    if (!isHydrated) return;

    if (lists.length === 0) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const newList: ShoppingListData = {
        id,
        name: "Minha Lista",
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLists([newList]);
      setActiveId(id);
    } else if (!activeId || !lists.find((l) => l.id === activeId)) {
      setActiveId(lists[0].id);
    }
  }, [isHydrated, lists, activeId]);

  const activeList = lists.find((l) => l.id === activeId) || null;

  const updateItems = useCallback(
    (updater: (items: ShoppingItem[]) => ShoppingItem[]) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeId
            ? { ...l, items: updater(l.items), updatedAt: new Date().toISOString() }
            : l
        )
      );
    },
    [activeId]
  );

  const addItem = useCallback(
    (name: string, price: string, quantity: number) => {
      const item: ShoppingItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name,
        price,
        quantity,
        checked: false,
      };
      updateItems((items) => [...items, item]);
    },
    [updateItems]
  );

  const toggleItem = useCallback(
    (id: string) => {
      updateItems((items) =>
        items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    },
    [updateItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((items) => items.filter((i) => i.id !== id));
    },
    [updateItems]
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      updateItems((items) =>
        items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
        )
      );
    },
    [updateItems]
  );

  const updatePrice = useCallback(
    (id: string, price: string) => {
      updateItems((items) =>
        items.map((i) => (i.id === id ? { ...i, price } : i))
      );
    },
    [updateItems]
  );

  const switchList = useCallback((id: string) => setActiveId(id), []);

  const createList = useCallback((name: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const newList: ShoppingListData = {
      id,
      name,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLists((prev) => [newList, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteList = useCallback(
    (id: string) => {
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  return {
    lists,
    activeList,
    activeId,
    addItem,
    toggleItem,
    removeItem,
    updateQuantity,
    updatePrice,
    switchList,
    createList,
    deleteList,
  };
}
