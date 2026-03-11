'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, List } from "lucide-react";
import CameraViewfinder from "./components/CameraViewFinder";
import CaptureBar from "./components/CaptureBar";
import ShoppingList from "./components/ShoppingList";
import ManualAddSheet from "./components/ManualAddSheet";
import PriceCaptureSheet from "./components/PriceCaptureSheet";
import { useRouter } from "next/navigation";
import { useActiveList } from "./hooks/useShoppingList";
import AppHeader from "./components/AppHeader";
import style from "./page.module.scss";
import { blobToBase64 } from "./utils/utils";
import { ApiBuyListResponse } from "./types/default";

const Index = () => {
  const [expanded, setExpanded] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [priceCapture, setPriceCapture] = useState<{ id: string; name: string } | null>(null);
  const [showImage, setShowImage] = useState(false);

  const {
    activeList,
    addItem,
    toggleItem,
    removeItem,
    updateQuantity,
    updatePrice,
  } = useActiveList();

  const handleCapture = async (file: Blob) => {
    // Aqui você pode processar a foto capturada, por exemplo, enviando para um OCR ou API de reconhecimento de produtos
    console.log("Foto capturada:", file);
    try {
      const result = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "listBuy",
          imageBase64: await blobToBase64(file),
        }),
      });

      const data = await result.json()

      const response = await data.response as ApiBuyListResponse;

      const { isValidProduct, products } = response

      console.log('retorno', data);
      if (!isValidProduct) {
        alert("Produto não reconhecido. Tente capturar novamente.");
        return;
      }

      if (products.length > 0) {
        products.forEach(p => {
          const priceInfo = p.prices.map(pr => `R$ ${pr.price.toFixed(2).replace(".", ",")} (x${pr.quantity})`).join(" ou ");
          addItem(p.name, priceInfo, 1);
        });
        return;
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={style.page}>

      {/* Header */}
      <AppHeader />

      {/* Camera area */}
      <motion.div
        className={style.cameraArea}
        animate={{ height: expanded ? "0%" : "35%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <CameraViewfinder onCapture={(file) => handleCapture(file)} />
      </motion.div>

      {/* Capture bar */}
      {!expanded && <CaptureBar onManualAdd={() => setManualOpen(true)} />}

      {/* Shopping list drawer */}
      <motion.div
        className={style.drawer}
        layout
      >
        <div className={style.drawerHeader}>
          <button
            onClick={() => setExpanded(!expanded)}
            className={style.expandButton}
          >
            <div className={style.expandHandle} />
            {expanded ? (
              <ChevronDown className={style.expandIcon} />
            ) : (
              <ChevronUp className={style.expandIcon} />
            )}
          </button>

        </div>

        <div className={style.listContent}>
          <ShoppingList
            list={activeList}
            onToggle={toggleItem}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
            onPriceClick={(id, name) => {
              setPriceCapture({ id, name })
            }
            }
          />
        </div>
      </motion.div>

      {/* Manual add bottom sheet */}
      <ManualAddSheet
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onAdd={addItem}
      />

      {/* Price capture sheet */}
      <PriceCaptureSheet
        open={!!priceCapture}
        itemName={priceCapture?.name || ""}
        onClose={() => setPriceCapture(null)}
        onSave={(price) => {
          if (priceCapture) {
            updatePrice(priceCapture.id, price);
            setPriceCapture(null);
          }
        }}
      />
    </div>
  );
};

export default Index;
