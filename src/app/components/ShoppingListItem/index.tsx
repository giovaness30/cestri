import { motion } from "framer-motion";
import { Check, Minus, Plus, Trash2, Camera } from "lucide-react";
import style from "./style.module.scss";

interface ShoppingListItemProps {
  id: string;
  name: string;
  price: string;
  quantity: number;
  checked?: boolean;
  index: number;
  onToggle: () => void;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onPriceClick: () => void;
}

const ShoppingListItem = ({
  name,
  price,
  quantity,
  checked = false,
  index,
  onToggle,
  onRemove,
  onIncrement,
  onDecrement,
  onPriceClick,
}: ShoppingListItemProps) => {
  const hasPrice = !!price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`${style.container} ${checked ? style.containerChecked : ""}`}
    >
      {/* Check */}
      <button
        onClick={onToggle}
        className={`${style.checkButton} ${checked ? style.checkButtonChecked : style.checkButtonUnchecked
          }`}
      >
        {checked && <Check className={style.checkIcon} strokeWidth={3} />}
      </button>

      {/* Product info */}
      <div className={style.productInfo}>
        <p
          className={`${style.productName} ${checked ? style.productNameChecked : ""}`}
        >
          {name}
        </p>
        <div className={style.quantityRow}>
          <div className={style.quantityControl}>
            <button
              onClick={onDecrement}
              className={`${style.quantityButton} ${style.quantityButtonLeft}`}
            >
              <Minus className={style.quantityIcon} />
            </button>
            <span className={style.quantityValue}>
              {quantity}
            </span>
            <button
              onClick={onIncrement}
              className={`${style.quantityButton} ${style.quantityButtonRight}`}
            >
              <Plus className={style.quantityIcon} />
            </button>
          </div>
        </div>
      </div>

      {/* Price / Add price */}
      <div className={style.actions}>
        {hasPrice ? (
          <span className={style.priceText}>{price}</span>
        ) : (
          <button
            onClick={onPriceClick}
            className={style.addPriceButton}
          >
            <Camera className={style.cameraIcon} />
            <span className={style.addPriceText}>Preço</span>
          </button>
        )}
        <button
          onClick={onRemove}
          className={style.removeButton}
        >
          <Trash2 className={style.trashIcon} />
        </button>
      </div>
    </motion.div>
  );
};

export default ShoppingListItem;
