'use client';
import { useEffect, useState } from "react";
import WishListItem from "../components/WishList/Item";
import Modal from "../components/Modal";
import CameraPreview from "../components/CameraPreview";
import style from './style.module.scss';
import { blobToBase64, currencyBRL } from "../utils/utils";

interface WishListItem {
  title: string;
  description: string;
  price: number;
  quantity: number;
}

const wishlist = () => {

  const [wishlist, setWishlist] = useState<WishListItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCamera, setModalCamera] = useState({ open: false, index: -1 });
  const [newItemData, setNewItemData] = useState({ title: '', quantity: 1 });

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = localStorage.getItem('wishlist');
        const data = response ? JSON.parse(response) : [];
        setWishlist(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  const handleAddItem = () => {
    const newItem: WishListItem = {
      title: newItemData.title,
      description: '',
      price: 0,
      quantity: newItemData.quantity,
    };

    const updatedWishlist = [...wishlist, newItem];
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setIsModalOpen(false);
    setNewItemData({ title: '', quantity: 0 });
  }

  const handleRemoveItem = (index: number) => {
    const updatedWishlist = wishlist.filter((_, i) => i !== index);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const handleClickItem = (index: number) => {
    // Lógica para lidar com o clique no item da wishlist
    console.log('Item clicado:', wishlist[index]);
    setModalCamera({ open: true, index });
  };

  const handleAddPriceItem = (index: number, price: number) => {
    const updatedWishlist = wishlist.map((item, i) => {
      if (i === index) {
        return { ...item, price };
      }
      return item;
    });
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const handleCapture = async (file: Blob) => {
    console.log("Captured file:", file);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "analyzeImage",
          instruction: "Analise a imagem e extraia os preços dos produtos, respondendo apenas com um array de números. Se não encontrar nenhum preço, responda com um array vazio.",
          imageBase64: await blobToBase64(file),
        }),
      });

      const data = await response.json();

      handleAddPriceItem(modalCamera.index, data.response.preco);

      console.log('retorno', data);
    } catch (error) {
      console.error("Error:", error);
    }

    setModalCamera({ open: false, index: -1 });
    // Lógica para lidar com a captura da câmera
  }

  return (
    <div>
      {
        wishlist.length > 0 ? (
          wishlist.map((item, index) => (
            <WishListItem
              key={index}
              id={index}
              title={item?.title}
              description={item?.description}
              price={item?.price}
              quantity={item?.quantity}
              onRemove={() => handleRemoveItem(index)}
              onClickItem={() => handleClickItem(index)}
            />
          ))) : (
          <p>Sua lista de desejos está vazia.</p>
        )
      }
      <div className={style.floatingActionsMenu}>
        <button onClick={() => setIsModalOpen(true)}>Adicionar Novo Item</button>
        <div>Total: {currencyBRL(wishlist.reduce((acc, item) => acc + item.price * item.quantity, 0))}</div>
      </div>

      {/* Modal para adicionar novo item */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} setOpen={setIsModalOpen}>
        <div>
          <input type="text" placeholder="Nome" onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })} />
          <input type="number" placeholder="Quantidade" value={newItemData.quantity ?? 1} onChange={(e) => setNewItemData({ ...newItemData, quantity: Number(e.target.value) })} />
          <button onClick={handleAddItem}>Add Item</button>
        </div>
      </Modal>


      <Modal open={modalCamera.open} onClose={() => setModalCamera({ open: false, index: -1 })} setOpen={(open) => setModalCamera({ open, index: modalCamera.index })}>
        <div>
          <CameraPreview onCapture={handleCapture} />
        </div>
      </Modal>
    </div>
  );
};

export default wishlist;