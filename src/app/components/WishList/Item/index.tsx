import style from './style.module.scss';

interface WishListItemProps {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  onRemove?: (id: number) => void;
  onClickItem?: (id: number) => void;
}

const WishListItem = ({ id, title, description, price, quantity, onRemove, onClickItem }: WishListItemProps) => {
  return (
    <div className={style.wishListItem} tabIndex={id} onClick={() => onClickItem && onClickItem(id)}>
      <div className={style.header}>
        <div>{title}</div>
        <div>{description}</div>
        <div>Preço: {price ? `R$ ${price.toFixed(2)}` : 'N/A'}</div>
        <div>Quantidade: {quantity ? quantity : '0'}</div>
        <button className={style.removeButton} onClick={() => onRemove && onRemove(id)}>x</button>
      </div>
    </div>
  )
}

export default WishListItem