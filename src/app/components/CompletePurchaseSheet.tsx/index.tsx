import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Store,
  MapPin,
  FileText,
  Camera,
  Check,
  Loader2,
} from "lucide-react";
import type { CompletionData } from "../../hooks/useShoppingList";
import { Button } from "../UI/Button";
import style from "./style.module.scss";

interface CompletePurchaseSheetProps {
  open: boolean;
  listName: string;
  total: number;
  onClose: () => void;
  onComplete: (data: Omit<CompletionData, "completedAt">) => void;
}

const CompletePurchaseSheet = ({
  open,
  listName,
  total,
  onClose,
  onComplete,
}: CompletePurchaseSheetProps) => {
  const [storeName, setStoreName] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onComplete({
      storeName: storeName.trim(),
      notes: notes.trim(),
      receiptPhoto,
      location,
    });
    // Reset
    setStoreName("");
    setNotes("");
    setReceiptPhoto(undefined);
    setLocation(undefined);
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
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={style.sheet}
          >
            <div className={style.content}>
              {/* Handle + close */}
              <div className={style.topRow}>
                <div className={style.handleWrapper}>
                  <div className={style.handle} />
                </div>
                <button
                  onClick={onClose}
                  className={style.closeButton}
                >
                  <X className={style.closeIcon} />
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className={style.title}>
                  CONCLUIR COMPRA
                </h2>
                <p className={style.subtitle}>
                  {listName} - <span className={style.totalValue}>R$ {total.toFixed(2).replace(".", ",")}</span>
                </p>
              </div>

              {/* Store name */}
              <div className={style.section}>
                <label className={style.label}>
                  Nome do Mercado
                </label>
                <div className={style.inputRow}>
                  <Store className={style.sectionIcon} />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Carrefour, Assaí..."
                    className={style.input}
                  />
                </div>
              </div>

              {/* Location */}
              <div className={style.section}>
                <label className={style.label}>
                  Localização
                </label>
                {location ? (
                  <div className={style.locationCaptured}>
                    <MapPin className={style.locationCapturedIcon} />
                    <span className={style.locationCapturedText}>
                      Localização capturada ✓
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className={style.locationButton}
                  >
                    {loadingLocation ? (
                      <Loader2 className={`${style.sectionIcon} ${style.spin}`} />
                    ) : (
                      <MapPin className={style.sectionIcon} />
                    )}
                    <span className={style.locationButtonText}>
                      {loadingLocation ? "Obtendo localização..." : "Capturar localização"}
                    </span>
                  </button>
                )}
              </div>

              {/* Receipt photo */}
              <div className={style.section}>
                <label className={style.label}>
                  Cupom Fiscal
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className={style.hiddenInput}
                  onChange={handlePhoto}
                />
                {receiptPhoto ? (
                  <div className={style.receiptPreview}>
                    <img
                      src={receiptPhoto}
                      alt="Cupom fiscal"
                      className={style.receiptImage}
                    />
                    <button
                      onClick={() => setReceiptPhoto(undefined)}
                      className={style.removeReceiptButton}
                    >
                      <X className={style.removeReceiptIcon} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={style.receiptButton}
                  >
                    <Camera className={style.sectionIcon} />
                    <span className={style.locationButtonText}>
                      Fotografar cupom fiscal
                    </span>
                  </button>
                )}
              </div>

              {/* Notes */}
              <div className={style.section}>
                <label className={style.label}>
                  Observações
                </label>
                <div className={style.notesRow}>
                  <FileText className={style.notesIcon} />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anotações sobre a compra..."
                    rows={3}
                    className={style.textarea}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                variant="success"
                className={style.submitButton}
                onClick={handleSubmit}
              >
                <Check className={style.submitIcon} />
                CONCLUIR COMPRA
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompletePurchaseSheet;
