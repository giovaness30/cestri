'use client'

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, MapPin, Calendar, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePriceHistory } from "../hooks/usePriceHistory";
import type { PriceRecord } from "../types/default";
import style from "./style.module.scss";

const ComparePricesPage = () => {
  const router = useRouter();
  const { uniqueItems, searchItems, getPriceHistory } = usePriceHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return searchItems(searchQuery);
  }, [searchQuery, searchItems]);

  const selectedItemHistory = useMemo(() => {
    if (!selectedItem) return [];
    return getPriceHistory(selectedItem);
  }, [selectedItem, getPriceHistory]);

  const handleSelectItem = (normalizedName: string) => {
    setSelectedItem(selectedItem === normalizedName ? null : normalizedName);
  };

  // Calculate price trend between two records
  const getPriceTrend = (current: PriceRecord, previous: PriceRecord | undefined) => {
    if (!previous) return null;
    const diff = current.price - previous.price;
    if (Math.abs(diff) < 0.01) return "same";
    return diff > 0 ? "up" : "down";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={style.page}>
      {/* Header */}
      <div className={style.header}>
        <button
          onClick={() => router.push("/")}
          className={style.headerButton}
        >
          <ArrowLeft className={style.headerIcon} />
        </button>
        <h1 className={style.title}>COMPARAR PREÇOS</h1>
        <div className={style.headerSpacer} />
      </div>

      {/* Search */}
      <div className={style.searchWrapper}>
        <div className={style.searchBox}>
          <Search className={style.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar item..."
            className={style.searchInput}
          />
        </div>
      </div>

      {/* Items List */}
      <div className={style.listContainer}>
        {uniqueItems.length === 0 ? (
          <div className={style.emptyState}>
            <Package className={style.emptyIcon} />
            <p className={style.emptyText}>Nenhum histórico de preços ainda</p>
            <p className={style.emptySubtext}>
              Conclua suas listas de compras para começar a comparar preços
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={style.emptyState}>
            <Search className={style.emptyIcon} />
            <p className={style.emptyText}>Nenhum item encontrado</p>
            <p className={style.emptySubtext}>
              Tente buscar por outro termo
            </p>
          </div>
        ) : (
          filteredItems.map((item, i) => (
            <ItemCard
              key={item.normalizedName}
              item={item}
              index={i}
              isSelected={selectedItem === item.normalizedName}
              onSelect={() => handleSelectItem(item.normalizedName)}
              history={selectedItem === item.normalizedName ? selectedItemHistory : []}
              getPriceTrend={getPriceTrend}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

function ItemCard({
  item,
  index,
  isSelected,
  onSelect,
  history,
  getPriceTrend,
  formatDate,
}: {
  item: { normalizedName: string; name: string; lastPrice: number; lastDate: string };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  history: PriceRecord[];
  getPriceTrend: (current: PriceRecord, previous: PriceRecord | undefined) => "up" | "down" | "same" | null;
  formatDate: (iso: string) => string;
}) {
  // Calculate stats
  const prices = history.map((h) => h.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : item.lastPrice;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : item.lastPrice;
  const averagePrice = prices.length > 0 
    ? prices.reduce((a, b) => a + b, 0) / prices.length 
    : item.lastPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`${style.itemCard} ${isSelected ? style.itemCardSelected : ""}`}
    >
      <div className={style.itemCardHeader} onClick={onSelect}>
        <div className={style.itemInfo}>
          <h3 className={style.itemName}>{item.name}</h3>
          <span className={style.itemLastDate}>
            Último: {formatDate(item.lastDate)}
          </span>
        </div>
        <div className={style.itemPriceInfo}>
          <span className={style.itemLastPrice}>
            R$ {item.lastPrice.toFixed(2).replace(".", ",")}
          </span>
          <span className={style.itemHistoryCount}>
            {history.length || "..."} {history.length === 1 ? "registro" : "registros"}
          </span>
        </div>
      </div>

      {/* Expanded History */}
      <AnimatePresence>
        {isSelected && history.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={style.historyWrapper}
          >
            {/* Stats Summary */}
            <div className={style.statsRow}>
              <div className={style.statItem}>
                <span className={style.statLabel}>Menor</span>
                <span className={`${style.statValue} ${style.statLow}`}>
                  R$ {lowestPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className={style.statItem}>
                <span className={style.statLabel}>Média</span>
                <span className={style.statValue}>
                  R$ {averagePrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className={style.statItem}>
                <span className={style.statLabel}>Maior</span>
                <span className={`${style.statValue} ${style.statHigh}`}>
                  R$ {highestPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* History List */}
            <div className={style.historyList}>
              {history.map((record, i) => {
                const trend = getPriceTrend(record, history[i + 1]);
                return (
                  <div key={`${record.listId}-${i}`} className={style.historyItem}>
                    <div className={style.historyDate}>
                      <Calendar className={style.historyDateIcon} />
                      <span>{formatDate(record.date)}</span>
                    </div>
                    <div className={style.historyLocation}>
                      <MapPin className={style.historyLocationIcon} />
                      <span className={style.historyLocationText}>{record.location}</span>
                    </div>
                    <div className={style.historyPriceWrap}>
                      {trend && (
                        <span className={`${style.trendIcon} ${style[`trend${trend.charAt(0).toUpperCase() + trend.slice(1)}`]}`}>
                          {trend === "up" && <TrendingUp />}
                          {trend === "down" && <TrendingDown />}
                          {trend === "same" && <Minus />}
                        </span>
                      )}
                      <span className={`${style.historyPrice} ${record.price === lowestPrice ? style.historyPriceLow : ""}`}>
                        R$ {record.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ComparePricesPage;
