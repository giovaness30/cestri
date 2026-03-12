'use client'

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Store,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Sparkles,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveList } from "../hooks/useShoppingList";
import style from "./style.module.scss";

// Dados mockados de preços de mercados
const mockStoresPrices: Record<string, { store: string; price: number; distance: string }[]> = {
  "Arroz": [
    { store: "Mercado Extra", price: 24.90, distance: "1.2 km" },
    { store: "Carrefour", price: 26.50, distance: "2.5 km" },
    { store: "Pão de Açúcar", price: 28.90, distance: "0.8 km" },
    { store: "Atacadão", price: 22.90, distance: "4.1 km" },
  ],
  "Feijão": [
    { store: "Mercado Extra", price: 8.90, distance: "1.2 km" },
    { store: "Carrefour", price: 9.50, distance: "2.5 km" },
    { store: "Pão de Açúcar", price: 7.90, distance: "0.8 km" },
    { store: "Atacadão", price: 6.90, distance: "4.1 km" },
  ],
  "Leite": [
    { store: "Mercado Extra", price: 5.49, distance: "1.2 km" },
    { store: "Carrefour", price: 4.99, distance: "2.5 km" },
    { store: "Pão de Açúcar", price: 5.79, distance: "0.8 km" },
    { store: "Atacadão", price: 4.49, distance: "4.1 km" },
  ],
  "Café": [
    { store: "Mercado Extra", price: 18.90, distance: "1.2 km" },
    { store: "Carrefour", price: 17.50, distance: "2.5 km" },
    { store: "Pão de Açúcar", price: 19.90, distance: "0.8 km" },
    { store: "Atacadão", price: 15.90, distance: "4.1 km" },
  ],
};

const allStores = ["Mercado Extra", "Carrefour", "Pão de Açúcar", "Atacadão"];

// Função para gerar preços aleatórios para produtos sem dados
function generateMockPrices(productName: string) {
  const basePrice = Math.random() * 30 + 5;
  return allStores.map((store, index) => ({
    store,
    price: Math.round((basePrice + (Math.random() * 6 - 3)) * 100) / 100,
    distance: ["1.2 km", "2.5 km", "0.8 km", "4.1 km"][index],
  }));
}

function getStorePrices(productName: string) {
  const normalizedName = Object.keys(mockStoresPrices).find(
    key => productName.toLowerCase().includes(key.toLowerCase())
  );
  return normalizedName ? mockStoresPrices[normalizedName] : generateMockPrices(productName);
}

interface ProductCompareCardProps {
  name: string;
  quantity: number;
  onSelectStore: (store: string, price: number) => void;
  selectedStore?: string;
}

const ProductCompareCard = ({ name, quantity, onSelectStore, selectedStore }: ProductCompareCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const prices = useMemo(() => getStorePrices(name), [name]);
  const sortedPrices = useMemo(() => [...prices].sort((a, b) => a.price - b.price), [prices]);
  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  const savings = worstPrice.price - bestPrice.price;
  const savingsPercent = Math.round((savings / worstPrice.price) * 100);

  return (
    <motion.div
      layout
      className={style.productCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        className={style.productHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={style.productInfo}>
          <h3 className={style.productName}>{name}</h3>
          <span className={style.productQuantity}>Qtd: {quantity}</span>
        </div>
        <div className={style.priceInfo}>
          <div className={style.bestPriceTag}>
            <TrendingDown className={style.trendIcon} />
            <span>R$ {bestPrice.price.toFixed(2).replace(".", ",")}</span>
          </div>
          <span className={style.savingsTag}>
            Economize {savingsPercent}%
          </span>
        </div>
        <div className={style.expandIconWrapper}>
          {expanded ? (
            <ChevronUp className={style.expandIcon} />
          ) : (
            <ChevronDown className={style.expandIcon} />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={style.pricesContainer}
          >
            <div className={style.pricesList}>
              {sortedPrices.map((item, index) => {
                const isBest = index === 0;
                const isWorst = index === sortedPrices.length - 1;
                const isSelected = selectedStore === item.store;

                return (
                  <button
                    key={item.store}
                    className={`${style.storeRow} ${isBest ? style.storeRowBest : ""} ${isSelected ? style.storeRowSelected : ""}`}
                    onClick={() => onSelectStore(item.store, item.price)}
                  >
                    <div className={style.storeInfo}>
                      <Store className={style.storeIcon} />
                      <div>
                        <p className={style.storeName}>{item.store}</p>
                        <p className={style.storeDistance}>{item.distance}</p>
                      </div>
                    </div>
                    <div className={style.storePriceWrapper}>
                      {isBest && (
                        <span className={style.bestBadge}>
                          <Sparkles className={style.badgeIcon} />
                          Melhor
                        </span>
                      )}
                      {isWorst && !isBest && (
                        <span className={style.worstBadge}>
                          <TrendingUp className={style.trendUpIcon} />
                          Mais caro
                        </span>
                      )}
                      <span className={`${style.storePrice} ${isBest ? style.storePriceBest : ""}`}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </span>
                      {isSelected && (
                        <div className={style.selectedCheck}>
                          <Check className={style.checkIcon} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ComparePage = () => {
  const router = useRouter();
  const { activeList } = useActiveList();
  const [selectedStores, setSelectedStores] = useState<Record<string, { store: string; price: number }>>({});

  const items = activeList?.items || [];

  const handleSelectStore = (productId: string, store: string, price: number) => {
    setSelectedStores(prev => ({
      ...prev,
      [productId]: { store, price }
    }));
  };

  const totalSavings = useMemo(() => {
    let potentialTotal = 0;
    let selectedTotal = 0;

    items.forEach(item => {
      const prices = getStorePrices(item.name);
      const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
      const worstPrice = sortedPrices[sortedPrices.length - 1].price;
      const bestPrice = sortedPrices[0].price;

      potentialTotal += worstPrice * item.quantity;
      selectedTotal += (selectedStores[item.id]?.price || bestPrice) * item.quantity;
    });

    return {
      potential: potentialTotal - items.reduce((sum, item) => {
        const prices = getStorePrices(item.name);
        const bestPrice = [...prices].sort((a, b) => a.price - b.price)[0].price;
        return sum + bestPrice * item.quantity;
      }, 0),
      selected: potentialTotal - selectedTotal,
      total: selectedTotal
    };
  }, [items, selectedStores]);

  const storeSummary = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {};
    
    items.forEach(item => {
      const selection = selectedStores[item.id];
      if (selection) {
        if (!summary[selection.store]) {
          summary[selection.store] = { count: 0, total: 0 };
        }
        summary[selection.store].count += 1;
        summary[selection.store].total += selection.price * item.quantity;
      }
    });

    return summary;
  }, [items, selectedStores]);

  return (
    <div className={style.page}>
      {/* Header */}
      <header className={style.header}>
        <button onClick={() => router.back()} className={style.backButton}>
          <ArrowLeft className={style.backIcon} />
        </button>
        <div className={style.headerTitle}>
          <BarChart3 className={style.headerIcon} />
          <h1 className={style.title}>Comparar Preços</h1>
        </div>
        <div className={style.headerSpacer} />
      </header>

      {/* Summary Card */}
      <div className={style.summaryCard}>
        <div className={style.summaryHeader}>
          <ShoppingCart className={style.summaryIcon} />
          <span className={style.summaryTitle}>Resumo da Lista</span>
        </div>
        <div className={style.summaryStats}>
          <div className={style.statBlock}>
            <span className={style.statLabel}>Itens</span>
            <span className={style.statValue}>{items.length}</span>
          </div>
          <div className={style.statDivider} />
          <div className={style.statBlock}>
            <span className={style.statLabel}>Total Estimado</span>
            <span className={style.statValueHighlight}>
              R$ {totalSavings.total.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className={style.statDivider} />
          <div className={style.statBlock}>
            <span className={style.statLabel}>Economia</span>
            <span className={style.statValueSuccess}>
              R$ {totalSavings.potential.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>

      {/* Store Summary */}
      {Object.keys(storeSummary).length > 0 && (
        <div className={style.storeSummary}>
          <h3 className={style.storeSummaryTitle}>Por Mercado</h3>
          <div className={style.storeSummaryList}>
            {Object.entries(storeSummary).map(([store, data]) => (
              <div key={store} className={style.storeSummaryItem}>
                <div className={style.storeSummaryInfo}>
                  <Store className={style.storeSummaryIcon} />
                  <span className={style.storeSummaryName}>{store}</span>
                  <span className={style.storeSummaryCount}>({data.count} itens)</span>
                </div>
                <span className={style.storeSummaryTotal}>
                  R$ {data.total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className={style.content}>
        {items.length === 0 ? (
          <div className={style.emptyState}>
            <ShoppingCart className={style.emptyIcon} />
            <p className={style.emptyTitle}>Lista vazia</p>
            <p className={style.emptySubtitle}>
              Adicione produtos à sua lista para comparar preços
            </p>
            <button
              onClick={() => router.push("/")}
              className={style.emptyButton}
            >
              Voltar para a lista
            </button>
          </div>
        ) : (
          <div className={style.productsList}>
            {items.map((item) => (
              <ProductCompareCard
                key={item.id}
                name={item.name}
                quantity={item.quantity}
                selectedStore={selectedStores[item.id]?.store}
                onSelectStore={(store, price) => handleSelectStore(item.id, store, price)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      {items.length > 0 && (
        <div className={style.bottomAction}>
          <button className={style.actionButton}>
            <Sparkles className={style.actionIcon} />
            Otimizar Compras com IA
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
