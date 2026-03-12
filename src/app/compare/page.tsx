'use client'

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Minus, History, ShoppingCart, ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveList, type ShoppingItem } from "../hooks/useShoppingList";
import style from "./page.module.scss";

type ComparisonStatus = "cheaper" | "expensive" | "equal" | "no-current";

interface HistoricPriceEntry {
  itemName: string;
  price: number;
  completedAt: string;
  listName: string;
  storeName?: string;
}

interface PurchaseHistoryItem {
  id: string;
  place: string;
  price: number;
  date: string;
}

interface ItemComparison {
  itemId: string;
  itemName: string;
  quantity: number;
  currentPrice: number | null;
  previousBest: number | null;
  previousAverage: number | null;
  previousLatest: number | null;
  previousCount: number;
  previousListName?: string;
  purchaseHistory: PurchaseHistoryItem[];
  priceDiff: number | null;
  status: ComparisonStatus;
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);

  if (!na || !nb) return false;
  if (na === nb) return true;

  const aWords = new Set(na.split(" "));
  const bWords = new Set(nb.split(" "));
  const common = [...aWords].filter((w) => bWords.has(w) && w.length > 2).length;

  return na.includes(nb) || nb.includes(na) || common >= 2;
}

function parseCurrencyValue(value: string): number[] {
  const parseLocalizedNumber = (token: string): number => {
    const clean = token.trim();
    const hasComma = clean.includes(",");
    const hasDot = clean.includes(".");

    if (hasComma && hasDot) {
      return Number(clean.replace(/\./g, "").replace(",", "."));
    }

    if (hasComma) {
      return Number(clean.replace(",", "."));
    }

    return Number(clean);
  };

  const pricesFromCurrencyTag = [...value.matchAll(/R\$\s*(\d+(?:[\.,]\d{1,2})?)/gi)].map((m) =>
    parseLocalizedNumber(m[1])
  );

  if (pricesFromCurrencyTag.length > 0) {
    return pricesFromCurrencyTag.filter((n) => Number.isFinite(n) && n > 0);
  }

  const plainValue = value.trim();
  if (/^\d+(?:[\.,]\d{1,2})?$/.test(plainValue)) {
    const parsed = parseLocalizedNumber(plainValue);
    return Number.isFinite(parsed) && parsed > 0 ? [parsed] : [];
  }

  // Fallback for manual values like "12,50" or "12.50"
  const looseMatches = [...value.matchAll(/\d+[\.,]\d{1,2}/g)].map((m) =>
    parseLocalizedNumber(m[0])
  );

  return looseMatches.filter((n) => Number.isFinite(n) && n > 0);
}

function formatMoney(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function buildHistoryEntries(
  items: ShoppingItem[],
  completedAt: string,
  listName: string,
  storeName?: string
): HistoricPriceEntry[] {
  return items.flatMap((item) => {
    if (!item.price) return [];
    const parsed = parseCurrencyValue(item.price);
    if (parsed.length === 0) return [];

    return parsed.map((price) => ({
      itemName: item.name,
      price,
      completedAt,
      listName,
      storeName,
    }));
  });
}

const ComparePage = () => {
  const router = useRouter();
  const { lists, activeId } = useActiveList();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedListId && lists.some((l) => l.id === selectedListId)) return;
    if (activeId && lists.some((l) => l.id === activeId)) {
      setSelectedListId(activeId);
      return;
    }
    setSelectedListId(lists[0]?.id || null);
  }, [lists, activeId, selectedListId]);

  const selectedList = useMemo(
    () => lists.find((l) => l.id === selectedListId) || null,
    [lists, selectedListId]
  );

  const historyLists = useMemo(() => {
    if (!selectedList) return [];
    return lists.filter((l) => l.id !== selectedList.id && (l.completed || !!l.completion?.completedAt));
  }, [lists, selectedList]);

  const historicEntries = useMemo(
    () =>
      historyLists.flatMap((list) =>
        buildHistoryEntries(
          list.items,
          list.completion?.completedAt || list.updatedAt,
          list.name,
          list.completion?.storeName
        )
      ),
    [historyLists]
  );

  const allHistoricEntries = historicEntries;

  const comparisons = useMemo<ItemComparison[]>(() => {
    if (!selectedList) return [];

    return selectedList.items.map((item) => {
      const currentPrices = item.price ? parseCurrencyValue(item.price) : [];
      const currentPrice = currentPrices.length > 0 ? Math.min(...currentPrices) : null;

      const exactHistory = allHistoricEntries.filter(
        (entry) => normalizeName(entry.itemName) === normalizeName(item.name)
      );

      const matchingHistory = (exactHistory.length > 0
        ? exactHistory
        : allHistoricEntries.filter((entry) => namesMatch(item.name, entry.itemName))
      ).sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));

      const previousCount = matchingHistory.length;
      const previousBest = previousCount > 0 ? Math.min(...matchingHistory.map((h) => h.price)) : null;
      const previousAverage =
        previousCount > 0
          ? matchingHistory.reduce((sum, h) => sum + h.price, 0) / previousCount
          : null;
      const previousLatest = previousCount > 0 ? matchingHistory[0].price : null;
      const previousListName = previousCount > 0 ? matchingHistory[0].listName : undefined;
      const purchaseHistory: PurchaseHistoryItem[] = matchingHistory.map((entry, idx) => ({
        id: `${entry.listName}-${entry.completedAt}-${entry.price}-${idx}`,
        place: entry.storeName || entry.listName || "Local nao informado",
        price: entry.price,
        date: entry.completedAt,
      }));

      const priceDiff =
        currentPrice !== null && previousBest !== null ? currentPrice - previousBest : null;

      let status: ComparisonStatus = "equal";
      if (currentPrice === null) {
        status = "no-current";
      } else if (previousBest === null || priceDiff === null) {
        status = "equal";
      } else if (Math.abs(priceDiff) < 0.01) {
        status = "equal";
      } else {
        status = priceDiff > 0 ? "expensive" : "cheaper";
      }

      return {
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        currentPrice,
        previousBest,
        previousAverage,
        previousLatest,
        previousCount,
        previousListName,
        purchaseHistory,
        priceDiff,
        status,
      };
    });
  }, [selectedList, allHistoricEntries]);

  const summary = useMemo(() => {
    const withCurrent = comparisons.filter((c) => c.currentPrice !== null);
    const withHistory = comparisons.filter((c) => c.previousBest !== null);
    const fullyComparable = comparisons.filter(
      (c) => c.currentPrice !== null && c.previousBest !== null
    );

    const expensiveCount = comparisons.filter((c) => c.status === "expensive").length;
    const cheaperCount = comparisons.filter((c) => c.status === "cheaper").length;

    const currentTotal = withCurrent.reduce((sum, c) => sum + (c.currentPrice || 0) * c.quantity, 0);
    const bestHistoryTotal = withHistory.reduce((sum, c) => sum + (c.previousBest || 0) * c.quantity, 0);
    const comparableCurrentTotal = fullyComparable.reduce(
      (sum, c) => sum + (c.currentPrice || 0) * c.quantity,
      0
    );
    const comparableBestHistoryTotal = fullyComparable.reduce(
      (sum, c) => sum + (c.previousBest || 0) * c.quantity,
      0
    );
    const potentialSaving = comparableCurrentTotal - comparableBestHistoryTotal;

    return {
      comparedItems: withHistory.length,
      expensiveCount,
      cheaperCount,
      currentTotal,
      bestHistoryTotal,
      potentialSaving,
    };
  }, [comparisons]);

  return (
    <div className={style.page}>
      <div className={style.header}>
        <button onClick={() => router.push("/")} className={style.backButton}>
          <ArrowLeft className={style.backIcon} />
        </button>
        <h1 className={style.title}>COMPARAR PRECO</h1>
      </div>

      <div className={style.content}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={style.selectorCard}
        >
          <label className={style.label}>Lista para comparar</label>
          <div className={style.selectWrap}>
            <ShoppingBasket className={style.selectIcon} />
            <select
              value={selectedListId || ""}
              onChange={(e) => setSelectedListId(e.target.value || null)}
              className={style.select}
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} {list.completed ? "(Concluida)" : "(Atual)"}
                </option>
              ))}
            </select>
          </div>
          <p className={style.helperText}>
            Compara os produtos da lista escolhida com historico de listas concluidas.
          </p>
        </motion.div>

        {!selectedList ? (
          <div className={style.emptyState}>
            <History className={style.emptyIcon} />
            <p className={style.emptyTitle}>Nenhuma lista encontrada</p>
            <p className={style.emptyText}>Crie uma lista para iniciar comparacoes de preco.</p>
          </div>
        ) : historyLists.length === 0 ? (
          <div className={style.emptyState}>
            <History className={style.emptyIcon} />
            <p className={style.emptyTitle}>Sem historico suficiente</p>
            <p className={style.emptyText}>Conclua ao menos uma lista para liberar comparacoes com compras anteriores.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={style.summaryGrid}
            >
              <div className={style.summaryCard}>
                <p className={style.summaryLabel}>Itens comparados</p>
                <p className={style.summaryValue}>{summary.comparedItems}</p>
              </div>
              <div className={style.summaryCard}>
                <p className={style.summaryLabel}>Mais caros agora</p>
                <p className={style.summaryValueDanger}>{summary.expensiveCount}</p>
              </div>
              <div className={style.summaryCard}>
                <p className={style.summaryLabel}>Mais baratos agora</p>
                <p className={style.summaryValuePositive}>{summary.cheaperCount}</p>
              </div>
              <div className={style.summaryCard}>
                <p className={style.summaryLabel}>Diferenca potencial</p>
                <p
                  className={
                    summary.potentialSaving >= 0
                      ? style.summaryValueDanger
                      : style.summaryValuePositive
                  }
                >
                  {formatMoney(Math.abs(summary.potentialSaving))}
                </p>
              </div>
            </motion.div>

            <div className={style.itemsList}>
              {comparisons.map((item, index) => (
                <motion.div
                  key={item.itemId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.03 }}
                  className={style.itemCard}
                >
                  <div className={style.itemHeader}>
                    <div>
                      <h3 className={style.itemName}>{item.itemName}</h3>
                      <p className={style.itemQuantity}>Quantidade: {item.quantity}</p>
                    </div>

                    <div
                      className={`${style.badge} ${item.status === "expensive"
                        ? style.badgeDanger
                        : item.status === "cheaper"
                          ? style.badgePositive
                          : style.badgeNeutral
                        }`}
                    >
                      {item.status === "expensive" ? (
                        <TrendingUp className={style.badgeIcon} />
                      ) : item.status === "cheaper" ? (
                        <TrendingDown className={style.badgeIcon} />
                      ) : (
                        <Minus className={style.badgeIcon} />
                      )}
                      <span>
                        {item.status === "expensive"
                          ? "Acima do historico"
                          : item.status === "cheaper"
                            ? "Abaixo do historico"
                            : item.status === "no-current"
                              ? "Sem preco atual"
                              : "Sem variacao"}
                      </span>
                    </div>
                  </div>

                  <div className={style.pricesGrid}>
                    <div>
                      <p className={style.priceLabel}>Preco atual</p>
                      <p className={style.priceValue}>
                        {item.currentPrice !== null ? formatMoney(item.currentPrice) : "Nao informado"}
                      </p>
                    </div>

                    <div>
                      <p className={style.priceLabel}>Melhor historico</p>
                      <p className={style.priceValue}>
                        {item.previousBest !== null ? formatMoney(item.previousBest) : "Sem registro"}
                      </p>
                    </div>

                    <div>
                      <p className={style.priceLabel}>Media historica</p>
                      <p className={style.priceValue}>
                        {item.previousAverage !== null ? formatMoney(item.previousAverage) : "Sem registro"}
                      </p>
                    </div>

                    <div>
                      <p className={style.priceLabel}>Ultimo preco</p>
                      <p className={style.priceValue}>
                        {item.previousLatest !== null ? formatMoney(item.previousLatest) : "Sem registro"}
                      </p>
                    </div>
                  </div>

                  {item.previousListName && (
                    <p className={style.referenceText}>
                      Baseado em {item.previousCount} registro(s), ultimo em: {item.previousListName}
                    </p>
                  )}

                  {item.purchaseHistory.length > 0 && (
                    <div className={style.historySection}>
                      <p className={style.historyTitle}>Historico de compras</p>
                      <ul className={style.historyList}>
                        {item.purchaseHistory.map((history) => (
                          <li key={history.id} className={style.historyItem}>
                            <span className={style.historyPlace}>{history.place}</span>
                            <span className={style.historyMeta}>
                              {formatMoney(history.price)} - {new Date(history.date).toLocaleDateString("pt-BR")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparePage;