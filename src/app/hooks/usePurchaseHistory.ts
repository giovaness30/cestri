'use client'

import { useState, useEffect, useCallback } from "react";
import { CompletedShoppingList, CompletedShoppingItem, GeoLocation } from "../types/default";
import { ShoppingListData, ShoppingItem } from "./useShoppingList";

const HISTORY_KEY = "purchase-history";

function loadHistory(): CompletedShoppingList[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: CompletedShoppingList[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function usePurchaseHistory() {
  const [history, setHistory] = useState<CompletedShoppingList[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveHistory(history);
  }, [isHydrated, history]);

  const completeList = useCallback(
    (
      list: ShoppingListData,
      marketName: string,
      purchaseDate: string,
      location?: GeoLocation,
      notes?: string,
      receiptImage?: string
    ) => {
      // Converte itens da lista para itens concluídos
      const completedItems: CompletedShoppingItem[] = list.items
        .filter(item => item.checked && item.price)
        .map(item => {
          const priceNum = parseFloat(
            item.price.replace(/[^\d,.-]/g, "").replace(",", ".")
          );
          return {
            id: item.id,
            name: item.name,
            price: isNaN(priceNum) ? 0 : priceNum,
            quantity: item.quantity,
          };
        });

      const totalAmount = completedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const completedList: CompletedShoppingList = {
        id: genId(),
        listId: list.id,
        listName: list.name,
        items: completedItems,
        marketName,
        purchaseDate,
        location,
        notes,
        receiptImage,
        totalAmount,
        createdAt: new Date().toISOString(),
      };

      setHistory(prev => [completedList, ...prev]);
      return completedList.id;
    },
    []
  );

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  }, []);

  const getItemPriceHistory = useCallback(
    (itemName: string) => {
      const priceHistory: {
        marketName: string;
        price: number;
        date: string;
        location?: GeoLocation;
      }[] = [];

      history.forEach(purchase => {
        purchase.items.forEach(item => {
          // Busca por nome similar (case insensitive)
          if (item.name.toLowerCase().includes(itemName.toLowerCase()) ||
              itemName.toLowerCase().includes(item.name.toLowerCase())) {
            priceHistory.push({
              marketName: purchase.marketName,
              price: item.price,
              date: purchase.purchaseDate,
              location: purchase.location,
            });
          }
        });
      });

      // Ordena por data mais recente
      return priceHistory.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    [history]
  );

  const getMarketSummary = useCallback(() => {
    const marketData: Record<
      string,
      { totalSpent: number; visitCount: number; lastVisit: string }
    > = {};

    history.forEach(purchase => {
      if (!marketData[purchase.marketName]) {
        marketData[purchase.marketName] = {
          totalSpent: 0,
          visitCount: 0,
          lastVisit: purchase.purchaseDate,
        };
      }
      marketData[purchase.marketName].totalSpent += purchase.totalAmount;
      marketData[purchase.marketName].visitCount += 1;
      if (new Date(purchase.purchaseDate) > new Date(marketData[purchase.marketName].lastVisit)) {
        marketData[purchase.marketName].lastVisit = purchase.purchaseDate;
      }
    });

    return marketData;
  }, [history]);

  return {
    history,
    isHydrated,
    completeList,
    deleteHistoryItem,
    getItemPriceHistory,
    getMarketSummary,
  };
}
