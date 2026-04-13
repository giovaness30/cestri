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
  promoMinQty?: number;
  regularUnitPrice?: string;
  promoLabel?: string;
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
  promoMinQty,
  regularUnitPrice,
  promoLabel,
  onToggle,
  onRemove,
  onIncrement,
  onDecrement,
  onPriceClick,
}: ShoppingListItemProps) => {
  const hasPrice = !!price;

  const isPromoActive = !!promoMinQty && hasPrice && quantity >= promoMinQty;
  const isPromoInvalid = !!promoMinQty && !hasPrice;

  const savingsPercent = (() => {
    if (!isPromoActive || !regularUnitPrice) return null;
    const regular = parseFloat(regularUnitPrice.replace(/[^\d,.-]/g, "").replace(",", "."));
    const promo = parseFloat(price.replace(/[^\d,.-]/g, "").replace(",", "."));
    if (isNaN(regular) || isNaN(promo) || regular === 0) return null;
    return Math.round((1 - promo / regular) * 100);
  })();

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

        {/* Badge de promoção / caixa ativa */}
        {isPromoActive && (
          <div className={style.promoBadgeRow}>
            <span className={promoLabel === "Caixa" ? style.promoBadgeBox : style.promoBadge}>
              {promoLabel === "Caixa" ? `Caixa · ${promoMinQty} un.` : `Promoção · x${promoMinQty} un.`}
            </span>
            {savingsPercent !== null && (
              <span className={style.promoSavings}>-{savingsPercent}%</span>
            )}
          </div>
        )}
      </div>

      {/* Price / Add price */}
      <div className={style.actions}>
        {hasPrice ? (
          <div className={style.priceBlock}>
            <span className={style.priceText}>{price}<span className={style.pricePerUnit}>/un.</span></span>
          </div>
        ) : (
          <div className={style.addPriceGroup}>
            <button
              onClick={onPriceClick}
              className={style.addPriceButton}
            >
              <Camera className={style.cameraIcon} />
              <span className={style.addPriceText}>Preço</span>
            </button>
            {isPromoInvalid && (
              <span className={style.promoHint}>mín. {promoMinQty} un.</span>
            )}
          </div>
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
