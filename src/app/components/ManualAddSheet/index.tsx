import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../UI/Button";
import style from "./style.module.scss";

interface ManualAddSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, price: string, quantity: number) => void;
}

const ManualAddSheet = ({ open, onClose, onAdd }: ManualAddSheetProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim(), price.trim(), quantity);
      onClose();
      setName("");
      setPrice("");
      setQuantity(1);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={style.overlay}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={style.sheet}
          >
            <div className={style.handleWrapper}>
              <div className={style.handleBar} />
            </div>

            <div className={style.header}>
              <h3 className={style.title}>
                ADICIONAR ITEM
              </h3>
              <button
                onClick={onClose}
                className={style.closeButton}
              >
                <X className={style.closeIcon} />
              </button>
            </div>

            <div className={style.content}>
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  Nome do produto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Arroz Tio João 5kg"
                  className={style.input}
                />
              </div>

              <div className={style.row}>
                <div className={style.priceField}>
                  <label className={style.label}>
                    Preço (opcional)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="R$ 0,00"
                    className={style.input}
                  />
                </div>

                <div className={style.quantityField}>
                  <label className={style.label}>
                    Qtd
                  </label>
                  <div className={style.quantityControl}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`${style.quantityButton} ${style.quantityButtonLeft}`}
                    >
                      <Minus className={style.quantityIcon} />
                    </button>
                    <span className={style.quantityValue}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`${style.quantityButton} ${style.quantityButtonRight}`}
                    >
                      <Plus className={style.quantityIcon} />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="capture"
                className={style.submitButton}
                onClick={handleAdd}
                disabled={!name.trim()}
              >
                ADICIONAR À LISTA
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManualAddSheet;
