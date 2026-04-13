'use client'

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronRight, CheckCircle2, LoaderCircle } from "lucide-react";
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
import Modal from "./components/Modal";
import { modalMultiPriceEmpty } from "./enums/emptyEnum";
import InputLabelGroup from "./components/UI/Inputs/InputLabelGroup";

const Index = () => {
  const [expanded, setExpanded] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [priceCapture, setPriceCapture] = useState<{ id: string; name: string } | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isAnalyzingCapture, setIsAnalyzingCapture] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [modalMultiPrice, setModalMultiPrice] = useState(modalMultiPriceEmpty);

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
    setIsAnalyzingCapture(true);
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

      if (!result.ok) {
        throw new Error("Falha ao analisar imagem com IA");
      }

      const data = await result.json()

      const response = await data.response as ApiBuyListResponse;

      const { isValidProduct, product } = response

      console.log('retorno', data);
      if (!isValidProduct) {
        alert("Produto não reconhecido. Tente capturar novamente.");
        return;
      }

      // Se múltiplos preços, abrir modal para escolha
      if (product.prices.length > 1) {
        setModalMultiPrice({
          open: true,
          priceSelected: 0,
          prices: product.prices,
          name: product.name
        });
        return
      }

      if (product) {
        const pr = product.prices[0];
        const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
        const isHighlighted = pr.quantity > 1;
        addItem(
          product.name,
          fmt(pr.price),
          pr.quantity,
          isHighlighted ? pr.quantity : undefined,
          undefined,
          pr.label,
        );
        return;
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAnalyzingCapture(false);
      setFrozenFrame(null);
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
        <CameraViewfinder
          onCapture={(file) => handleCapture(file)}
          frozenFrame={frozenFrame ?? undefined}
          onFrozenFrame={(url) => setFrozenFrame(url)}
        />
        {isAnalyzingCapture && (
          <div className={style.loadingOverlay}>
            <LoaderCircle className={style.loadingIcon} />
            <p className={style.loadingText}>Analisando imagem...</p>
          </div>
        )}
      </motion.div>

      {/* Capture bar */}
      {!expanded && <CaptureBar onManualAdd={() => setManualOpen(true)} isLoading={isAnalyzingCapture} />}

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
      <Modal
        open={modalMultiPrice.open}
        onClose={() => setModalMultiPrice(modalMultiPriceEmpty)}
        title="MÚLTIPLOS PREÇOS"
      >
        <p className={style.multiPriceProductName}>{modalMultiPrice.name}</p>
        <div className={style.multiPriceList}>
          {(() => {
            const singleUnitPrice = modalMultiPrice.prices.find(p => p.quantity === 1)?.price ?? null;
            return modalMultiPrice.prices.map((pr, index) => {
              const isBox = pr.label === "Caixa";
              const isPromo = !isBox && pr.quantity > 1;
              const isHighlighted = isBox || isPromo;
              // price já é por unidade (definido no prompt da IA)
              const unitPrice = pr.price;
              const totalPrice = pr.price * pr.quantity;
              const savings = isHighlighted && singleUnitPrice
                ? Math.round((1 - unitPrice / singleUnitPrice) * 100)
                : null;
              const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
              return (
                <div
                  key={index}
                  className={`${style.multiPriceOption} ${isBox ? style.multiPriceOptionBox : isPromo ? style.multiPriceOptionPromo : ""}`}
                  onClick={() => {
                    addItem(
                      modalMultiPrice.name,
                      fmt(unitPrice),
                      pr.quantity,
                      isHighlighted ? pr.quantity : undefined,
                      isHighlighted && singleUnitPrice ? fmt(singleUnitPrice) : undefined,
                      pr.label,
                    );
                    setModalMultiPrice(modalMultiPriceEmpty);
                  }}
                >
                  <div className={style.multiPriceInfo}>
                    {isBox ? (
                      <>
                        <div className={style.multiPriceBadgeRow}>
                          <span className={style.multiPriceBadgeBox}>Caixa · {pr.quantity} un.</span>
                          {savings !== null && (
                            <span className={style.multiPriceSavingsTag}>-{savings}%</span>
                          )}
                        </div>
                        <span className={style.multiPriceAmount}>{fmt(unitPrice)}<span className={style.multiPricePerUnit}>/un.</span></span>
                        <span className={style.multiPriceTotalLine}>Total da caixa · {fmt(totalPrice)}</span>
                      </>
                    ) : isPromo ? (
                      <>
                        <div className={style.multiPriceBadgeRow}>
                          <span className={style.multiPriceBadge}>Promoção · x{pr.quantity} un.</span>
                          {savings !== null && (
                            <span className={style.multiPriceSavingsTag}>-{savings}%</span>
                          )}
                        </div>
                        <span className={style.multiPriceAmount}>{fmt(unitPrice)}<span className={style.multiPricePerUnit}>/un.</span></span>
                        <span className={style.multiPriceTotalLine}>Total do kit · {fmt(totalPrice)}</span>
                      </>
                    ) : (
                      <>
                        <span className={style.multiPriceAmount}>{fmt(pr.price)}</span>
                        <span className={style.multiPriceQuantityLabel}>x{pr.quantity} unidade · preço normal</span>
                      </>
                    )}
                  </div>
                  <ChevronRight className={style.multiPriceArrow} />
                </div>
              );
            });
          })()}
        </div>
      </Modal>
    </div>
  );
};

export default Index;
