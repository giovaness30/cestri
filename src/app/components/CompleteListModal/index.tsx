'use client'

import { useState, useEffect } from "react";
import { X, MapPin, Loader2, CheckCircle, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../UI/Button";
import { useGeolocation } from "../../hooks/useGeolocation";
import type { ShoppingItem, ShoppingListData } from "../../hooks/useShoppingList";
import type { LocationInfo } from "../../types/default";
import style from "./style.module.scss";

interface CompleteListModalProps {
  open: boolean;
  onClose: () => void;
  list: ShoppingListData | null;
  onComplete: (location: LocationInfo) => void;
}

const CompleteListModal = ({ open, onClose, list, onComplete }: CompleteListModalProps) => {
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  const { location, isLoading, error, getCurrentLocation, clearLocation } = useGeolocation();

  // Calculate totals
  const itemsWithPrice = list?.items.filter((item) => {
    const price = parseFloat(item.price);
    return !isNaN(price) && price > 0;
  }) || [];

  const total = itemsWithPrice.reduce((sum, item) => {
    const price = parseFloat(item.price);
    return sum + (price * item.quantity);
  }, 0);

  // Update location fields when geolocation returns
  useEffect(() => {
    if (location) {
      setLocationName(location.name);
      setLocationAddress(location.address || "");
      setCoords({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setLocationName("");
      setLocationAddress("");
      setIsEditing(false);
      setCoords({});
      clearLocation();
    }
  }, [open, clearLocation]);

  const handleDetectLocation = async () => {
    await getCurrentLocation();
  };

  const handleComplete = () => {
    if (!locationName.trim()) return;

    const locationInfo: LocationInfo = {
      name: locationName.trim(),
      address: locationAddress.trim() || undefined,
      lat: coords.lat,
      lng: coords.lng,
    };

    onComplete(locationInfo);
    onClose();
  };

  const canComplete = locationName.trim().length > 0 && itemsWithPrice.length > 0;

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
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={style.sheet}
          >
            <div className={style.handleWrapper}>
              <div className={style.handleBar} />
            </div>

            <div className={style.header}>
              <h3 className={style.title}>CONCLUIR LISTA</h3>
              <button onClick={onClose} className={style.closeButton}>
                <X className={style.closeIcon} />
              </button>
            </div>

            <div className={style.content}>
              {/* Summary Section */}
              <div className={style.summaryCard}>
                <div className={style.summaryHeader}>
                  <CheckCircle className={style.summaryIcon} />
                  <span className={style.summaryTitle}>{list?.name || "Lista"}</span>
                </div>
                <div className={style.summaryDetails}>
                  <div className={style.summaryRow}>
                    <span className={style.summaryLabel}>Itens com preço:</span>
                    <span className={style.summaryValue}>{itemsWithPrice.length}</span>
                  </div>
                  <div className={style.summaryRow}>
                    <span className={style.summaryLabel}>Total:</span>
                    <span className={style.summaryTotal}>
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className={style.locationSection}>
                <div className={style.sectionHeader}>
                  <MapPin className={style.sectionIcon} />
                  <span className={style.sectionTitle}>Local da compra</span>
                </div>

                {!locationName && !isLoading && !isEditing && (
                  <Button
                    variant="outline"
                    className={style.detectButton}
                    onClick={handleDetectLocation}
                  >
                    <MapPin className={style.detectIcon} />
                    Detectar minha localização
                  </Button>
                )}

                {isLoading && (
                  <div className={style.loadingState}>
                    <Loader2 className={style.loadingIcon} />
                    <span className={style.loadingText}>Detectando localização...</span>
                  </div>
                )}

                {error && !locationName && (
                  <div className={style.errorState}>
                    <p className={style.errorText}>{error}</p>
                    <Button
                      variant="ghost"
                      className={style.retryButton}
                      onClick={() => setIsEditing(true)}
                    >
                      Inserir manualmente
                    </Button>
                  </div>
                )}

                {(locationName || isEditing) && !isLoading && (
                  <div className={style.locationForm}>
                    <div className={style.fieldGroup}>
                      <label className={style.label}>Nome do local</label>
                      <div className={style.inputWrapper}>
                        <input
                          type="text"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          placeholder="Ex: Supermercado Extra"
                          className={style.input}
                        />
                        {location && !isEditing && (
                          <button
                            className={style.editButton}
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit3 className={style.editIcon} />
                          </button>
                        )}
                      </div>
                    </div>

                    {locationAddress && (
                      <div className={style.addressDisplay}>
                        <span className={style.addressText}>{locationAddress}</span>
                      </div>
                    )}
                  </div>
                )}

                {!locationName && !isLoading && !error && !isEditing && (
                  <button
                    className={style.manualLink}
                    onClick={() => setIsEditing(true)}
                  >
                    ou inserir manualmente
                  </button>
                )}
              </div>

              {/* Warning if no priced items */}
              {itemsWithPrice.length === 0 && (
                <div className={style.warningBox}>
                  <p className={style.warningText}>
                    Nenhum item tem preço definido. Adicione preços aos itens antes de concluir.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className={style.actions}>
                <Button
                  variant="ghost"
                  className={style.cancelButton}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  className={style.confirmButton}
                  onClick={handleComplete}
                  disabled={!canComplete}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteListModal;
