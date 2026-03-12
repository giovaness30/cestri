import { ShoppingCart, CheckCircle } from "lucide-react";
import ShoppingListItem from "../ShoppingListItem";
import { ShoppingListData } from "@/app/hooks/useShoppingList";
import style from "./style.module.scss";

interface ShoppingListProps {
  list: ShoppingListData | null;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onPriceClick: (id: string, name: string) => void;
  onCompleteList?: () => void;
}

const ShoppingList = ({ list, onToggle, onRemove, onUpdateQuantity, onPriceClick, onCompleteList }: ShoppingListProps) => {
  const items = list?.items || [];
  const checkedCount = items.filter((i) => i.checked).length;
  
  // Verifica se todos os itens estão marcados e têm preço
  const allItemsReady = items.length > 0 && items.every(
    (i) => i.checked && i.price && i.price.trim() !== ""
  );
  const checkedWithPrice = items.filter(
    (i) => i.checked && i.price && i.price.trim() !== ""
  ).length;

  const total = items.reduce((sum, i) => {
    if (!i.price) return sum;
    const n = parseFloat(i.price.replace(/[^\d,.-]/g, "").replace(",", "."));
    return isNaN(n) ? sum : sum + n * i.quantity;
  }, 0);

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <div className={style.headerLeft}>
          <div className={style.cartIconWrapper}>
            <ShoppingCart className={style.cartIcon} />
          </div>
          <div>
            <h2 className={style.title}>
              {list?.name?.toUpperCase() || "MINHA LISTA"}
            </h2>
            <p className={style.subtitle}>
              {`${checkedCount} de ${items.length} itens`}
            </p>
          </div>
        </div>
        <div className={style.totalBlock}>
          <p className={style.totalLabel}>Total</p>
          <span className={style.totalValue}>
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>
        {onCompleteList && items.length > 0 && (
          <button
            onClick={onCompleteList}
            disabled={!allItemsReady}
            className={`${style.completeButton} ${allItemsReady ? style.completeButtonReady : ''}`}
            title={
              allItemsReady
                ? "Concluir lista"
                : `${checkedWithPrice}/${items.length} itens com preço marcados`
            }
          >
            <CheckCircle className={style.completeIcon} />
          </button>
        )}
      </div>

      <div className={style.divider} />

      {/* Items */}
      <div className={style.itemsContainer}>
        {items.length === 0 ? (
          <div className={style.emptyState}>
            <ShoppingCart className={style.emptyIcon} />
            <p className={style.emptyTitle}>Lista vazia</p>
            <p className={style.emptySubtitle}>Capture ou adicione itens</p>
          </div>
        ) : (
          items.map((item, i) => (
            <ShoppingListItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              checked={item.checked}
              index={i}
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
              onIncrement={() => onUpdateQuantity(item.id, 1)}
              onDecrement={() => onUpdateQuantity(item.id, -1)}
              onPriceClick={() => onPriceClick(item.id, item.name)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
