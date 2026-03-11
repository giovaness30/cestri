'use client'

import Image from "next/image";
import style from "./page.module.scss";
import { use, useEffect, useMemo, useRef, useState } from "react";
import CameraPreview from "./components/CameraPreview";
import CustomIcon from "./components/CustomIcons";
import ICONS from "./enums/iconsEnum";
import { ApiResult, ScannedItem } from "./types/default";
import { blobToBase64, currencyBRL } from "./utils/utils";
import SwithButton from "./components/SwithButton";
import Modal from "./components/Modal";
import CaptureBar from "./components/CaptureBar";

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

  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [modalSelectAddItem, setModalSelectAddItem] = useState<ModalSelectAddItemState>({ open: false, name: "", prices: [] });

  const [tempNewItemAdd, setTempNewItemAdd] = useState<AddItemParams | null>(null);

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
      const prices = data.response?.products?.[0]?.prices;

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
    <div data-theme={dark ? "dark" : "light"} className={style.app}>

      <div className={style.container}>

        {/* Tabs de modo */}
        <div className={`${style.row}`} role="tablist" aria-label="Modo de captura">
          <SwithButton options={optionsModeCapture} value={scanMode} onChange={e => setScanMode(e === "camera" ? "camera" : "manual")} />
        </div>

        {/* Seção principal */}
        <main className={style.section}>
          {scanMode === "camera" ? (
            <section className={style.card}>
              <div className={style.flexBetweenWrap}>
                <strong className={style.strongInline}>
                  <CustomIcon path={ICONS.camera} /> Capturar o rótulo
                </strong>
                <div className={style.row}>
                  <CameraPreview onCapture={handleCapture} />
                </div>
              </div>

              <CaptureBar onManualAdd={() => setScanMode("manual")} />
            </section>
          ) : (
            <section className={style.card}>
              <strong className={style.strongInline}>
                <CustomIcon path={ICONS.edit} /> Adicionar manualmente
              </strong>
              <form onSubmit={handleManualAdd} className={`${style.row} ${style.rowMt8}`}>
                <input
                  className={`${style.input} ${style.inputFlex1}`} placeholder="Nome do produto"
                  value={tempNewItemAdd?.name}
                  onChange={(e) => { setTempNewItemAdd({ ...tempNewItemAdd, name: e.target.value }) }}
                />
                <input value={tempNewItemAdd?.quantity} onChange={(e) => { setTempNewItemAdd({ ...tempNewItemAdd, quantity: e.target.value }) }} className={`${style.input} ${style.inputW140}`} placeholder="Quantidade" inputMode="decimal" />
                <input value={tempNewItemAdd?.price} onChange={(e) => { setTempNewItemAdd({ ...tempNewItemAdd, price: e.target.value }) }} className={`${style.input} ${style.inputW140}`} placeholder="Preço (ex: 12,90)" inputMode="decimal" />
                <button type="submit" className={style.button}>Adicionar</button>
              </form>
            </section>
          )}

          {/* Lista de itens */}
          <section className={style.card}>
            <div className={style.itemsHeader}>
              <strong className={style.strongInline}>Descrição</strong>
              <strong className={style.strongInline}>Quantidade</strong>
              <strong className={style.strongInline}>Preço Un.</strong>
            </div>
            <hr />
            <div className={style.list}>
              {items.length === 0 && <div className={style.muted}>Nenhum produto na lista.</div>}
              {items.map(it => (
                <div key={it.id} className={style.item}>
                  <div className={style.gridOnly}>
                    <span className={style.fontSemibold}>{it.name}</span>
                    {it.camPrint && <img width={50} height={50} src={`${it.camPrint}`} alt={it.name} />}
                    <small className={style.muted}>{it.source === "camera" ? "📸 câmera" : "✍️ manual"} • {new Date(it.createdAt).toLocaleString()}</small>
                  </div>
                  <div className={style.row}>
                    <span className={style.mono}>{`${currencyBRL(it.price)} un.`}</span>
                    <div>
                      <button
                        className={style.button} aria-label={`Diminuir uma unidade de ${it.name}`}
                        onClick={() => setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}
                      >
                        -
                      </button>
                      <input
                        className={style.button}
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
                        className={style.button} aria-label={`Adicionar mais uma unidade de ${it.name}`}
                        onClick={() => setItems(prev => prev.map(p => p.id === it.id ? { ...p, quantity: p.quantity + 1 } : p))}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={style.button}
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


        </main>

        <footer className={style.footer}>
        </footer>

        {/* BottomMenu */}
        <div className={style.floatingActionsMenu}>
          {/* <button >Adicionar Novo Item</button> */}
          <div>Itens: {items.length}</div>
          <div>Total: {currencyBRL(items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</div>
        </div>
      </div>
      {/* // Modal para selecionar preço quando houver mais de uma opção */}
      <Modal open={modalSelectAddItem.open} onClose={() => setModalSelectAddItem({ open: false, name: "", prices: [] })} setOpen={(open) => setModalSelectAddItem(prev => ({ ...prev, open }))}>
        <div className={style.modalContent}>
          <h2>Selecione Umas das opções</h2>
          {
            modalSelectAddItem.prices.map((p, index) => (
              <button key={index} className={style.button} onClick={() => {
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
