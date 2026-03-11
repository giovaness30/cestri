'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, ShoppingCart, Trash2, Calendar } from "lucide-react";
import { Button } from "../components/UI/Button";
import { useRouter } from "next/navigation";
import { ShoppingListData, useActiveList } from "../hooks/useShoppingList";
import style from "./style.module.scss";

const Lists = () => {
  const router = useRouter();
  const { lists, switchList, createList, deleteList } = useActiveList();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

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
        {lists.length === 0 ? (
          <div className={style.emptyState}>
            <ShoppingCart className={style.emptyIcon} />
            <p className={style.emptyText}>Nenhuma lista criada ainda</p>
          </div>
        ) : (
          lists.map((list, i) => (
            <ListCard
              key={list.id}
              list={list}
              index={i}
              onOpen={() => handleOpen(list.id)}
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

export default Lists;
