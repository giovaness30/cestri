import { useState, useEffect, useCallback } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  price: string; // "" means no price yet (per-unit price)
  quantity: number;
  checked: boolean;
  promoMinQty?: number;       // quantidade mínima para o preço promocional valer
  regularUnitPrice?: string;  // preço unitário normal para calcular % de economia
  promoLabel?: string;        // ex: "Caixa", "Promoção"
}

export interface CompletionData {
  completedAt: string;
  storeName: string;
  notes: string;
  receiptPhoto?: string; // base64 data URL
  location?: { lat: number; lng: number };
}

export interface ShoppingListData {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
  completed?: boolean;
  completion?: CompletionData;
}

const LISTS_KEY = "shopping-lists";
const ACTIVE_KEY = "active-list-id";

function loadLists(): ShoppingListData[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LISTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLists(lists: ShoppingListData[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
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
  }, [lists, isHydrated]);

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
    setActiveId(typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_KEY));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveLists(lists);
  }, [lists, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeId, isHydrated]);

  // Auto-create a list if none active exists
  useEffect(() => {
    if (!isHydrated) return;

    const activeLists = lists.filter((l) => !l.completed);
    if (activeLists.length === 0 && !lists.some((l) => !l.completed)) {
      const id = genId();
      const newList: ShoppingListData = {
        id,
        name: "Minha Lista",
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLists((prev) => [newList, ...prev]);
      setActiveId(id);
    } else if (!activeId || !lists.find((l) => l.id === activeId && !l.completed)) {
      const first = lists.find((l) => !l.completed);
      setActiveId(first?.id || null);
    }
  }, [lists, activeId, isHydrated]);

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
    (name: string, price: string, quantity: number, promoMinQty?: number, regularUnitPrice?: string, promoLabel?: string) => {
      const item: ShoppingItem = {
        id: genId(),
        name,
        price,
        quantity,
        checked: false,
        promoMinQty,
        regularUnitPrice,
        promoLabel,
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
        items.map((i) => {
          if (i.id !== id) return i;
          const newQty = Math.max(1, i.quantity + delta);
          const promoInvalidated = !!i.promoMinQty && newQty < i.promoMinQty;
          return {
            ...i,
            quantity: newQty,
            price: promoInvalidated ? "" : i.price,
          };
        })
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

  const completeList = useCallback(
    (data: Omit<CompletionData, "completedAt">) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === activeId
            ? {
                ...l,
                completed: true,
                updatedAt: new Date().toISOString(),
                completion: {
                  ...data,
                  completedAt: new Date().toISOString(),
                },
              }
            : l
        )
      );
      // Switch to next active list or create new
      const remaining = lists.filter((l) => !l.completed && l.id !== activeId);
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
      } else {
        setActiveId(null);
      }
    },
    [activeId, lists]
  );

  const reopenList = useCallback((id: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, completed: false, completion: undefined, updatedAt: new Date().toISOString() }
          : l
      )
    );
    setActiveId(id);
  }, []);

  const switchList = useCallback((id: string) => setActiveId(id), []);

  const createList = useCallback((name: string) => {
    const id = genId();
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

  // Computed: is list ready to complete?
  const canComplete =
    activeList &&
    !activeList.completed &&
    activeList.items.length > 0 &&
    activeList.items.every((i) => i.checked && !!i.price);

  return {
    lists,
    activeList,
    activeId,
    addItem,
    toggleItem,
    removeItem,
    updateQuantity,
    updatePrice,
    completeList,
    reopenList,
    switchList,
    createList,
    deleteList,
    canComplete: !!canComplete,
  };
}
