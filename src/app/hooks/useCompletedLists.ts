'use client'

import { useState, useEffect, useCallback } from "react";
import type { CompletedList, CompletedItem, LocationInfo } from "../types/default";
import type { ShoppingItem } from "./useShoppingList";

const COMPLETED_LISTS_KEY = "completed-lists";

function loadCompletedLists(): CompletedList[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(COMPLETED_LISTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCompletedLists(lists: CompletedList[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPLETED_LISTS_KEY, JSON.stringify(lists));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useCompletedLists() {
  const [completedLists, setCompletedLists] = useState<CompletedList[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCompletedLists(loadCompletedLists());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCompletedLists(completedLists);
  }, [isHydrated, completedLists]);

  const completeList = useCallback(
    (
      listName: string,
      items: ShoppingItem[],
      location: LocationInfo
    ): CompletedList => {
      // Convert shopping items to completed items
      const completedItems: CompletedItem[] = items
        .filter((item) => {
          const price = parseFloat(item.price);
          return !isNaN(price) && price > 0;
        })
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
        }));

      // Calculate total
      const totalSpent = completedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const completedList: CompletedList = {
        id: genId(),
        name: listName,
        items: completedItems,
        completedAt: new Date().toISOString(),
        location,
        totalSpent,
      };

      setCompletedLists((prev) => [completedList, ...prev]);

      return completedList;
    },
    []
  );

  const deleteCompletedList = useCallback((id: string) => {
    setCompletedLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getCompletedList = useCallback(
    (id: string): CompletedList | undefined => {
      return completedLists.find((l) => l.id === id);
    },
    [completedLists]
  );

  return {
    completedLists,
    completeList,
    deleteCompletedList,
    getCompletedList,
    isHydrated,
  };
}
