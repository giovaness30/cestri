'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Store,
  MapPin,
} from "lucide-react";
import { useActiveList, type ShoppingListData } from "../hooks/useShoppingList"
import { Button } from "../components/UI/Button";
import { useRouter } from "next/navigation";
import style from "./style.module.scss";

const Lists = () => {
  const router = useRouter();
  const { lists, switchList, createList, deleteList, reopenList } = useActiveList();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<"active" | "completed">("active");

  const activeLists = lists.filter((l) => !l.completed);
  const completedLists = lists.filter((l) => l.completed);

  const handleCreate = () => {
    if (newName.trim()) {
      createList(newName.trim());
      setNewName("");
      setShowNew(false);
      router.push("/");
    }
  };

  const handleOpen = (id: string) => {
    switchList(id);
    router.push("/");
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
        <h1 className={style.title}>
          MINHAS LISTAS
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className={style.addButton}
        >
          <Plus className={style.addIcon} />
        </button>
      </div>

      {/* Tabs */}
      <div className={style.tabs}>
        <button
          onClick={() => setTab("active")}
          className={`${style.tabButton} ${tab === "active" ? style.tabButtonActive : style.tabButtonInactive}`}
        >
          Ativas ({activeLists.length})
          {tab === "active" && (
            <motion.div layoutId="tab-indicator" className={`${style.tabIndicator} ${style.tabIndicatorPrimary}`} />
          )}
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`${style.tabButton} ${tab === "completed" ? style.tabButtonCompleted : style.tabButtonInactive}`}
        >
          Concluídas ({completedLists.length})
          {tab === "completed" && (
            <motion.div layoutId="tab-indicator" className={`${style.tabIndicator} ${style.tabIndicatorAccent}`} />
          )}
        </button>
      </div>

      {/* New list form */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={style.newListWrapper}
          >
            <div className={style.newListContent}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da nova lista..."
                autoFocus
                className={style.newListInput}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                variant="capture"
                className={style.createButton}
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                CRIAR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lists */}
      <div className={style.listContainer}>
        {tab === "active" ? (
          activeLists.length === 0 ? (
            <div className={style.emptyState}>
              <ShoppingCart className={style.emptyIcon} />
              <p className={style.emptyText}>Nenhuma lista ativa</p>
            </div>
          ) : (
            activeLists.map((list, i) => (
              <ListCard
                key={list.id}
                list={list}
                index={i}
                onOpen={() => handleOpen(list.id)}
                onDelete={() => deleteList(list.id)}
              />
            ))
          )
        ) : completedLists.length === 0 ? (
          <div className={style.emptyState}>
            <CheckCircle2 className={style.emptyIcon} />
            <p className={style.emptyText}>Nenhuma compra concluída</p>
            <p className={style.emptySubtext}>Conclua uma lista para ver o histórico</p>
          </div>
        ) : (
          completedLists.map((list, i) => (
            <CompletedListCard
              key={list.id}
              list={list}
              index={i}
              onReopen={() => reopenList(list.id)}
              onDelete={() => deleteList(list.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

function ListCard({
  list,
  index,
  onOpen,
  onDelete,
}: {
  list: ShoppingListData;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const checkedCount = list.items.filter((i) => i.checked).length;
  const total = list.items.reduce((sum, i) => {
    if (!i.price) return sum;
    const n = parseFloat(i.price.replace(/[^\d,.-]/g, "").replace(",", "."));
    return isNaN(n) ? sum : sum + n * i.quantity;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={style.listCard}
      onClick={onOpen}
    >
      <div className={style.listCardRow}>
        <div className={style.listMainInfo}>
          <div className={style.listCartIconWrapper}>
            <ShoppingCart className={style.listCartIcon} />
          </div>
          <div className={style.listTextWrap}>
            <h3 className={style.listName}>
              {list.name}
            </h3>
            <div className={style.listMetaRow}>
              <span className={style.listMetaText}>
                {checkedCount}/{list.items.length} itens
              </span>
              <span className={style.listMetaDivider}>•</span>
              <div className={style.listDateWrap}>
                <Calendar className={style.listDateIcon} />
                <span className={style.listMetaText}>
                  {new Date(list.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={style.listActions}>
          {total > 0 && (
            <span className={style.listTotal}>
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={style.deleteButton}
          >
            <Trash2 className={style.deleteIcon} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompletedListCard({
  list,
  index,
  onReopen,
  onDelete,
}: {
  list: ShoppingListData;
  index: number;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const total = list.items.reduce((sum, i) => {
    if (!i.price) return sum;
    const n = parseFloat(i.price.replace(/[^\d,.-]/g, "").replace(",", "."));
    return isNaN(n) ? sum : sum + n * i.quantity;
  }, 0);

  const completion = list.completion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={style.completedCard}
    >
      <div className={style.listCardRow}>
        <div className={style.listMainInfo}>
          <div className={style.completedIconWrapper}>
            <CheckCircle2 className={style.completedIcon} />
          </div>
          <div className={style.listTextWrap}>
            <h3 className={style.listName}>
              {list.name}
            </h3>
            <div className={`${style.listMetaRow} ${style.listMetaRowWrap}`}>
              <span className={style.listMetaText}>
                {list.items.length} itens
              </span>
              {completion?.storeName && (
                <>
                  <span className={style.listMetaDivider}>•</span>
                  <div className={style.listDateWrap}>
                    <Store className={style.listDateIcon} />
                    <span className={style.listMetaText}>{completion.storeName}</span>
                  </div>
                </>
              )}
              {completion?.location && (
                <MapPin className={style.locationIcon} />
              )}
            </div>
            {completion?.completedAt && (
              <p className={style.completionDate}>
                Concluída em{" "}
                {new Date(completion.completedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        <div className={style.listActions}>
          <span className={style.listTotal}>
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
          <div className={style.completedActionRow}>
            <button
              onClick={onReopen}
              className={style.reopenButton}
              title="Reabrir lista"
            >
              <RotateCcw className={style.reopenIcon} />
            </button>
            <button
              onClick={onDelete}
              className={style.completedDeleteButton}
            >
              <Trash2 className={style.deleteIcon} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Lists;
