'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, MapPin, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompletedLists } from "../hooks/useCompletedLists";
import { usePriceHistory } from "../hooks/usePriceHistory";
import type { CompletedList } from "../types/default";
import style from "./style.module.scss";

const CompletedListsPage = () => {
  const router = useRouter();
  const { completedLists, deleteCompletedList } = useCompletedLists();
  const { deleteRecordsByListId } = usePriceHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (list: CompletedList) => {
    if (confirm(`Deseja excluir a lista "${list.name}"? Isso também removerá os dados do histórico de preços.`)) {
      deleteCompletedList(list.id);
      deleteRecordsByListId(list.id);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
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
        <h1 className={style.title}>LISTAS CONCLUÍDAS</h1>
        <div className={style.headerSpacer} />
      </div>

      {/* Lists */}
      <div className={style.listContainer}>
        {completedLists.length === 0 ? (
          <div className={style.emptyState}>
            <CheckCircle className={style.emptyIcon} />
            <p className={style.emptyText}>Nenhuma lista concluída ainda</p>
            <p className={style.emptySubtext}>
              Conclua suas listas de compras para ver o histórico aqui
            </p>
          </div>
        ) : (
          completedLists.map((list, i) => (
            <CompletedListCard
              key={list.id}
              list={list}
              index={i}
              expanded={expandedId === list.id}
              onToggle={() => setExpandedId(expandedId === list.id ? null : list.id)}
              onDelete={() => handleDelete(list)}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

function CompletedListCard({
  list,
  index,
  expanded,
  onToggle,
  onDelete,
  formatDate,
  formatTime,
}: {
  list: CompletedList;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={style.listCard}
    >
      <div className={style.listCardHeader} onClick={onToggle}>
        <div className={style.listMainInfo}>
          <div className={style.listIconWrapper}>
            <CheckCircle className={style.listIcon} />
          </div>
          <div className={style.listTextWrap}>
            <h3 className={style.listName}>{list.name}</h3>
            <div className={style.listMetaRow}>
              <div className={style.listDateWrap}>
                <Calendar className={style.listDateIcon} />
                <span className={style.listMetaText}>
                  {formatDate(list.completedAt)}
                </span>
              </div>
              <span className={style.listMetaDivider}>•</span>
              <span className={style.listMetaText}>
                {list.items.length} {list.items.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>
        </div>

        <div className={style.listActions}>
          <span className={style.listTotal}>
            R$ {list.totalSpent.toFixed(2).replace(".", ",")}
          </span>
          {expanded ? (
            <ChevronUp className={style.expandIcon} />
          ) : (
            <ChevronDown className={style.expandIcon} />
          )}
        </div>
      </div>

      {/* Location */}
      <div className={style.locationRow}>
        <MapPin className={style.locationIcon} />
        <span className={style.locationText}>{list.location.name}</span>
        {list.location.address && (
          <span className={style.locationAddress}>{list.location.address}</span>
        )}
      </div>

      {/* Expanded Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={style.itemsWrapper}
          >
            <div className={style.itemsList}>
              {list.items.map((item) => (
                <div key={item.id} className={style.itemRow}>
                  <span className={style.itemName}>
                    {item.quantity > 1 ? `${item.quantity}x ` : ""}{item.name}
                  </span>
                  <span className={style.itemPrice}>
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
            </div>

            <div className={style.cardFooter}>
              <span className={style.footerTime}>
                Concluída às {formatTime(list.completedAt)}
              </span>
              <button onClick={onDelete} className={style.deleteButton}>
                <Trash2 className={style.deleteIcon} />
                <span>Excluir</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CompletedListsPage;
