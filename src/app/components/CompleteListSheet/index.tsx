'use client'

import { useState, useRef } from "react";
import { X, MapPin, Calendar, Store, FileText, Camera, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../UI/Button";
import { GeoLocation } from "@/app/types/default";
import style from "./style.module.scss";

interface CompleteListSheetProps {
  open: boolean;
  listName: string;
  totalItems: number;
  totalAmount: number;
  onClose: () => void;
  onComplete: (
    marketName: string,
    purchaseDate: string,
    location?: GeoLocation,
    notes?: string,
    receiptImage?: string
  ) => void;
}

const CompleteListSheet = ({
  open,
  listName,
  totalItems,
  totalAmount,
  onClose,
  onComplete,
}: CompleteListSheetProps) => {
  const [marketName, setMarketName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada");
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permissão de localização negada");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Localização indisponível");
            break;
          case error.TIMEOUT:
            setLocationError("Tempo esgotado");
            break;
          default:
            setLocationError("Erro ao obter localização");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    if (!marketName.trim()) return;

    onComplete(
      marketName.trim(),
      purchaseDate,
      location || undefined,
      notes.trim() || undefined,
      receiptImage || undefined
    );

    // Reset form
    setMarketName("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setReceiptImage(null);
    setLocation(null);
    setLocationError(null);
  };

  const handleClose = () => {
    // Reset form on close
    setMarketName("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setReceiptImage(null);
    setLocation(null);
    setLocationError(null);
    onClose();
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
            onClick={handleClose}
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
              <h3 className={style.title}>CONCLUIR LISTA</h3>
              <button onClick={handleClose} className={style.closeButton}>
                <X className={style.closeIcon} />
              </button>
            </div>

            <div className={style.summary}>
              <div className={style.summaryItem}>
                <span className={style.summaryLabel}>Lista</span>
                <span className={style.summaryValue}>{listName}</span>
              </div>
              <div className={style.summaryItem}>
                <span className={style.summaryLabel}>Itens</span>
                <span className={style.summaryValue}>{totalItems}</span>
              </div>
              <div className={style.summaryItem}>
                <span className={style.summaryLabel}>Total</span>
                <span className={style.summaryValueHighlight}>
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <div className={style.content}>
              {/* Nome do mercado */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  <Store className={style.labelIcon} />
                  Nome do mercado *
                </label>
                <input
                  type="text"
                  value={marketName}
                  onChange={(e) => setMarketName(e.target.value)}
                  placeholder="Ex: Mercado Extra"
                  className={style.input}
                />
              </div>

              {/* Data da compra */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  <Calendar className={style.labelIcon} />
                  Data da compra
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={style.input}
                />
              </div>

              {/* Localização */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  <MapPin className={style.labelIcon} />
                  Localização (GPS)
                </label>
                {location ? (
                  <div className={style.locationSuccess}>
                    <CheckCircle className={style.locationSuccessIcon} />
                    <span>Localização capturada</span>
                    <button
                      onClick={() => setLocation(null)}
                      className={style.locationRemove}
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className={style.locationButton}
                  >
                    {loadingLocation ? (
                      <>
                        <Loader2 className={style.locationButtonIconSpin} />
                        Obtendo localização...
                      </>
                    ) : (
                      <>
                        <MapPin className={style.locationButtonIcon} />
                        Capturar localização atual
                      </>
                    )}
                  </button>
                )}
                {locationError && (
                  <span className={style.errorText}>{locationError}</span>
                )}
              </div>

              {/* Observações */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  <FileText className={style.labelIcon} />
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotações sobre a compra..."
                  className={style.textarea}
                  rows={2}
                />
              </div>

              {/* Cupom fiscal */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  <Camera className={style.labelIcon} />
                  Nota / Cupom fiscal
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className={style.fileInput}
                />
                {receiptImage ? (
                  <div className={style.receiptPreview}>
                    <img
                      src={receiptImage}
                      alt="Cupom fiscal"
                      className={style.receiptImage}
                    />
                    <button
                      onClick={() => {
                        setReceiptImage(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className={style.receiptRemove}
                    >
                      <X className={style.receiptRemoveIcon} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={style.receiptButton}
                  >
                    <Camera className={style.receiptButtonIcon} />
                    Fotografar cupom fiscal
                  </button>
                )}
              </div>

              <Button
                variant="capture"
                className={style.submitButton}
                onClick={handleComplete}
                disabled={!marketName.trim()}
              >
                SALVAR E CONCLUIR LISTA
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteListSheet;
