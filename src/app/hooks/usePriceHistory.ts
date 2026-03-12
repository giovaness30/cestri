'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PriceRecord, CompletedList } from "../types/default";

const PRICE_HISTORY_KEY = "price-history";
const MAX_RECORDS = 1000;

function loadPriceHistory(): PriceRecord[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(PRICE_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePriceHistory(records: PriceRecord[]) {
  if (typeof window === "undefined") return;
  // Limit to MAX_RECORDS to prevent localStorage overflow
  const limitedRecords = records.slice(0, MAX_RECORDS);
  window.localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(limitedRecords));
}

// Normalize item name for better matching
export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

export function usePriceHistory() {
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPriceHistory(loadPriceHistory());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    savePriceHistory(priceHistory);
  }, [isHydrated, priceHistory]);

  // Add price records from a completed list
  const addPriceRecordsFromList = useCallback((list: CompletedList) => {
    const newRecords: PriceRecord[] = list.items.map((item) => ({
      itemName: item.name,
      normalizedName: normalizeItemName(item.name),
      price: item.price,
      quantity: item.quantity,
      location: list.location.name,
      date: list.completedAt,
      listId: list.id,
    }));

    setPriceHistory((prev) => [...newRecords, ...prev]);
  }, []);

  // Get price history for a specific item
  const getPriceHistory = useCallback(
    (itemName: string): PriceRecord[] => {
      const normalized = normalizeItemName(itemName);
      return priceHistory
        .filter((record) => record.normalizedName === normalized)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [priceHistory]
  );

  // Get all unique items
  const uniqueItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; lastPrice: number; lastDate: string }>();
    
    // Process in reverse to get the most recent occurrence of each item
    [...priceHistory].reverse().forEach((record) => {
      if (!itemMap.has(record.normalizedName)) {
        itemMap.set(record.normalizedName, {
          name: record.itemName,
          lastPrice: record.price,
          lastDate: record.date,
        });
      }
    });

    // Now update with most recent data
    priceHistory.forEach((record) => {
      const existing = itemMap.get(record.normalizedName);
      if (existing && new Date(record.date) > new Date(existing.lastDate)) {
        itemMap.set(record.normalizedName, {
          name: record.itemName,
          lastPrice: record.price,
          lastDate: record.date,
        });
      }
    });

    return Array.from(itemMap.entries()).map(([normalizedName, data]) => ({
      normalizedName,
      name: data.name,
      lastPrice: data.lastPrice,
      lastDate: data.lastDate,
    }));
  }, [priceHistory]);

  // Search items by name
  const searchItems = useCallback(
    (query: string) => {
      if (!query.trim()) return uniqueItems;
      
      const normalizedQuery = normalizeItemName(query);
      return uniqueItems.filter((item) =>
        item.normalizedName.includes(normalizedQuery)
      );
    },
    [uniqueItems]
  );

  // Delete all records for a specific list
  const deleteRecordsByListId = useCallback((listId: string) => {
    setPriceHistory((prev) => prev.filter((record) => record.listId !== listId));
  }, []);

  return {
    priceHistory,
    addPriceRecordsFromList,
    getPriceHistory,
    uniqueItems,
    searchItems,
    deleteRecordsByListId,
    isHydrated,
  };
}
