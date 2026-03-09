'use client'

import Image from "next/image";
import styles from "./page.module.scss";
import { use, useEffect, useMemo, useRef, useState } from "react";
import CameraPreview from "./components/CameraPreview";
import CustomIcon from "./components/CustomIcons";
import ICONS from "./enums/iconsEnum";
import { ApiResult, ScannedItem } from "./types/default";
import { blobToBase64, currencyBRL } from "./utils/utils";
import SwithButton from "./components/SwithButton";
import Modal from "./components/Modal";

interface ModalSelectAddItemState {
  open: boolean;
  name: string;
  prices: { price: number; quantity: number }[];
}

interface AddItemParams {
  name: string;
  price: number;
  source: "camera" | "manual";
  camPrint?: string;
  quantity: number;
}

export default function Home() {

  const [prompt, setPrompt] = useState("");
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [apiEndpoint, setApiEndpoint] = useState<string>("/api/ocr");
  const [modalSelectAddItem, setModalSelectAddItem] = useState<ModalSelectAddItemState>({ open: false, name: "", prices: [] });

  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);

  const total = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);
  const successfulCaptures = apiResults.filter(r => r.success).length;
  const successRate = apiResults.length ? (successfulCaptures / apiResults.length) * 100 : 0;


  useEffect(() => {
    const storedItems = localStorage.getItem("items");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  function resetAll() {
    setItems([]);
    localStorage.removeItem("items");
  }


  const handleCapture = (file: Blob) => {
    console.log("Captured file:", file);

    handleSubmit(file).catch(err => console.error("Error in handleSubmit:", err));
  };

  function addItem({ name, price, source, camPrint, quantity }: AddItemParams) {
    const newItem: ScannedItem = { id: crypto.randomUUID(), name, price, source, createdAt: Date.now(), camPrint, quantity };
    setItems(prev => [newItem, ...prev]);
  }

  function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = inputNameRef.current?.value?.trim() || "";
    const raw = inputPriceRef.current?.value?.replace(/,/g, ".") || "0";
    const price = parseFloat(raw);
    if (!name || !isFinite(price)) return;
    addItem({
      name,
      price,
      source: "manual",
      quantity: 1
    });
    if (inputNameRef.current) inputNameRef.current.value = "";
    if (inputPriceRef.current) inputPriceRef.current.value = "";
  }

  const optionsModeCapture = [
    { label: 'camera', value: 'camera', icon: ICONS.camera },
    { label: 'manual', value: 'manual', icon: ICONS.edit }
  ]


  const handleSubmit = async (file: Blob) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "listBuy",
          imageBase64: await blobToBase64(file),
        }),
      });

      const data = await response.json();

      console.log('retorno', data);
      const prices = data.response.prices

      if (prices && prices.length > 1) {
        setModalSelectAddItem({ open: true, name: data.response.name, prices });
        return
      }

      addItem({
        name: data.response.name,
        price: data.response.prices[0]?.price || 0,
        source: "camera",
        camPrint: `data:image/jpeg;base64,${await blobToBase64(file)}`,
        quantity: data.response.prices[0]?.quantity || 1
      });

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div data-theme={dark ? "dark" : "light"} className={styles.app}>

      <div className={styles.container}>

        {/* Tabs de modo */}
        <div className={`${styles.row} ${styles.rowMt12}`} role="tablist" aria-label="Modo de captura">
          <SwithButton options={optionsModeCapture} value={scanMode} onChange={e => setScanMode(e === "camera" ? "camera" : "manual")} />
        </div>

        {/* Seção principal */}
        <main className={styles.section}>
          {scanMode === "camera" ? (
            <section className={styles.card}>
              <div className={styles.flexBetweenWrap}>
                <strong className={styles.strongInline}>
                  <CustomIcon path={ICONS.camera} /> Capturar o rótulo
                </strong>
                <div className={styles.row}>
                  <CameraPreview onCapture={handleCapture} />
                </div>
              </div>
            </section>
          ) : (
            <section className={styles.card}>
              <strong className={styles.strongInline}>
                <CustomIcon path={ICONS.edit} /> Adicionar manualmente
              </strong>
              <form onSubmit={handleManualAdd} className={`${styles.row} ${styles.rowMt8}`}>
                <input ref={inputNameRef} className={`${styles.input} ${styles.inputFlex1}`} placeholder="Nome do produto" />
                <input ref={inputPriceRef} className={`${styles.input} ${styles.inputW140}`} placeholder="Preço (ex: 12,90)" inputMode="decimal" />
                <button type="submit" className={styles.button}>Adicionar</button>
              </form>
            </section>
          )}

          {/* Lista de itens */}
          <section className={styles.card}>
            <div className={styles.itemsHeader}>
              <strong>Itens ({items.length})</strong>
              <span className={styles.mono}>Total: {currencyBRL(total)}</span>
            </div>
            <div className={styles.list}>
              {items.length === 0 && <div className={styles.muted}>Nenhum item ainda.</div>}
              {items.map(it => (
                <div key={it.id} className={styles.item}>
                  <div className={styles.gridOnly}>
                    <span className={styles.fontSemibold}>{it.name}</span>
                    {it.camPrint && <img width={50} height={50} src={`${it.camPrint}`} alt={it.name} />}
                    <small className={styles.muted}>{it.source === "camera" ? "📸 câmera" : "✍️ manual"} • {new Date(it.createdAt).toLocaleString()}</small>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.mono}>{`${currencyBRL(it.price)} un.`}</span>
                    <div>
                      <button
                        className={styles.button} aria-label={`Diminuir uma unidade de ${it.name}`}
                        onClick={() => setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}
                      >
                        -
                      </button>
                      <input
                        className={styles.button}
                        style={{ width: '50%' }}
                        value={it.quantity}
                        type="number"
                        aria-label={`Adicionar mais uma unidade de ${it.name}`}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value);
                          // if (isNaN(quantity) || quantity < 1) {
                          //   setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity: 1 } : p))
                          //   return
                          // }
                          setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity } : p))
                        }}
                      />
                      <button
                        className={styles.button} aria-label={`Adicionar mais uma unidade de ${it.name}`}
                        onClick={() => setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity: p.quantity + 1 } : p))}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.button}
                      aria-label={`Remover ${it.name}`}
                      onClick={() => setItems(prev => prev.filter(p => p.id !== it.id))}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Painel de debug OCR */}
          {showDebug && (
            <section className={styles.card}>
              <strong className={styles.strongInline}>
                <CustomIcon path={ICONS.bug} /> OCR / API Debug
              </strong>
              <div className={styles.list}>
                {apiResults.length === 0 && <div className={styles.muted}>Sem chamadas ainda.</div>}
                {apiResults.map(r => (
                  <div key={r.id} className={`${styles.item} ${styles.itemStart}`}>
                    <div className={styles.gridGap4}>
                      <div className={styles.rowGap6}>
                        <span className={styles.kbd}>{r.status}</span>
                        <small className={styles.muted}>{r.processingTime} ms</small>
                        <small className={styles.muted}>{r.apiEndpoint}</small>
                      </div>
                      <div className={styles.muted}>{r.responseText}</div>
                      <div>
                        <small className={styles.muted}>Preços detectados: </small>
                        <span className={styles.mono}>{r.detectedPrices.join(", ")}</span>
                      </div>
                      <div>
                        <small className={styles.muted}>Melhor preço: </small>
                        <strong className={styles.mono}>{r.bestPrice != null ? currencyBRL(r.bestPrice) : "—"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`${styles.muted} ${styles.mt8}`}>
                Capturas bem-sucedidas: {successfulCaptures}/{apiResults.length} — {successRate.toFixed(0)}%
              </div>
            </section>
          )}
        </main>

        <footer className={styles.footer}>

        </footer>
      </div>
      {/* // Modal para selecionar preço quando houver mais de uma opção */}
      <Modal open={modalSelectAddItem.open} onClose={() => setModalSelectAddItem({ open: false, name: "", prices: [] })} setOpen={(open) => setModalSelectAddItem(prev => ({ ...prev, open }))}>
        <div className={styles.modalContent}>
          <h2>Selecione Umas das opções</h2>
          {
            modalSelectAddItem.prices.map((p, index) => (
              <button key={index} className={styles.button} onClick={() => {
                addItem({
                  name: modalSelectAddItem.name,
                  price: p.price, source: "camera",
                  camPrint: undefined,
                  quantity: p.quantity
                });
                setModalSelectAddItem({ open: false, name: "", prices: [] });
              }}>
                {p.quantity} por {currencyBRL(p.price)}
              </button>
            ))
          }

        </div>
      </Modal>
    </div>
  );
}
