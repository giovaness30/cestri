'use client'

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ChevronDown, List, CheckCircle2 } from "lucide-react";
import CameraViewfinder from "./components/CameraViewFinder";
import CaptureBar from "./components/CaptureBar";
import ShoppingList from "./components/ShoppingList";
import ManualAddSheet from "./components/ManualAddSheet";
import PriceCaptureSheet from "./components/PriceCaptureSheet";
import { useActiveList } from "./hooks/useShoppingList";
import AppHeader from "./components/AppHeader";
import style from "./page.module.scss";
import { blobToBase64 } from "./utils/utils";
import { ApiBuyListResponse } from "./types/default";
import CompletePurchaseSheet from "./components/CompletePurchaseSheet.tsx";

const Index = () => {
  const [expanded, setExpanded] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [priceCapture, setPriceCapture] = useState<{ id: string; name: string } | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  const {
    activeList,
    addItem,
    toggleItem,
    removeItem,
    updateQuantity,
    updatePrice,
    completeList,
    canComplete
  } = useActiveList();

  const total = (activeList?.items || []).reduce((sum, i) => {
    if (!i.price) return sum;
    const n = parseFloat(i.price.replace(/[^\d,.-]/g, "").replace(",", "."));
    return isNaN(n) ? sum : sum + n * i.quantity;
  }, 0);

  const handleCapture = async (file: Blob) => {
    // window.location.href = URL.createObjectURL(file); // para teste, abre a foto capturada em nova aba. Substitua por lógica de processamento da imagem
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
        style={expanded ? { marginTop: '1rem' } : {}}
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

        {/* Complete button */}
        <AnimatePresence>
          {canComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={style.completeButtonWrap}
            >
              <button
                onClick={() => setCompleteOpen(true)}
                className={style.completeButton}
              >
                <CheckCircle2 className={style.completeButtonIcon} />
                CONCLUIR COMPRA
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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

      <CompletePurchaseSheet
        open={completeOpen}
        listName={activeList?.name || ""}
        total={total}
        onClose={() => setCompleteOpen(false)}
        onComplete={(data) => {
          completeList(data);
          setCompleteOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
