'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { useMemo, useRef, useState } from "react";
import CameraPreview from "./components/CameraPreview";
import CustomIcon from "./components/CustomIcons";
import ICONS from "./enums/iconsEnum";
import { ApiResult, ScannedItem } from "./types/default";
import { currencyBRL } from "./utils/utils";

export default function Home() {

  const [prompt, setPrompt] = useState("");
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [apiEndpoint, setApiEndpoint] = useState<string>("/api/ocr");

  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);

  const total = useMemo(() => items.reduce((acc, i) => acc + i.price, 0), [items]);
  const successfulCaptures = apiResults.filter(r => r.success).length;
  const successRate = apiResults.length ? (successfulCaptures / apiResults.length) * 100 : 0;

  function resetAll() {
    setItems([]);
    setApiResults([]);
  }


  const handleCapture = (file: Blob) => {
    console.log("Captured file:", file);

    handleSubmit(file).catch(err => console.error("Error in handleSubmit:", err));


  };

  function addItem(name: string, price: number, source: "camera" | "manual") {
    const newItem: ScannedItem = { id: crypto.randomUUID(), name, price, source, createdAt: Date.now() };
    setItems(prev => [newItem, ...prev]);
  }

  function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = inputNameRef.current?.value?.trim() || "";
    const raw = inputPriceRef.current?.value?.replace(/,/g, ".") || "0";
    const price = parseFloat(raw);
    if (!name || !isFinite(price)) return;
    addItem(name, price, "manual");
    if (inputNameRef.current) inputNameRef.current.value = "";
    if (inputPriceRef.current) inputPriceRef.current.value = "";
  }


  const handleSubmit = async (file: Blob) => {
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

      addItem(data.response.nome, data.response.preco, "camera");

      console.log('retorno', data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div data-theme={dark ? "dark" : "light"} className={styles.app}>
      {/* Tema */}
      <style>{`
        :root { --bg:#0b0c0f; --fg:#e7e9ee; --mutedBg:#14161a; --border:#262a33; --btnBg:#171a20 }
        [data-theme='light'] { --bg:#f7f7fb; --fg:#0b0c0f; --mutedBg:#ffffff; --border:#e5e7ef; --btnBg:#ffffff }
        button:focus, input:focus { outline: 2px solid #7aa2ff; outline-offset: 2px; }
        .tab { user-select: none; }
        .container { max-width: 980px; margin: 0 auto; padding: 20px; color: var(--fg); }
        .header { display: grid; gap: 12px; }
        .h1 { display: flex; align-items: center; gap: 8px; margin: 0; }
        .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rowMt8 { margin-top: 8px; }
        .rowMt12 { margin-top: 12px; }
        .button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border); background: var(--btnBg); color: var(--fg); border-radius: 10px; padding: 8px 12px; cursor: pointer; }
        .pill { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border); background: transparent; color: var(--fg); border-radius: 999px; padding: 8px 12px; cursor: pointer; }
        .pillActive { background: var(--mutedBg); }
        .section { margin-top: 12px; display: grid; gap: 12px; }
        .card { border: 1px solid var(--border); background: var(--mutedBg); border-radius: 12px; padding: 12px; display: grid; gap: 8px; }
        .list { display: grid; gap: 8px; }
        .item { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid var(--border); border-radius: 10px; padding: 8px; }
        .itemStart { align-items: flex-start; }
        .input { border: 1px solid var(--border); background: var(--bg); color: var(--fg); border-radius: 10px; padding: 8px 10px; }
        .inputFull { display: block; width: 100%; margin-top: 6px; }
        .inputFlex1 { flex: 1; }
        .inputW140 { width: 140px; }
        .flexBetweenWrap { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .strongInline { display: flex; align-items: center; gap: 8px; }
        .gridMt10 { margin-top: 10px; display: grid; gap: 8px; }
        .itemsHeader { display: flex; align-items: center; justify-content: space-between; }
        .gridOnly { display: grid; }
        .gridGap4 { display: grid; gap: 4px; }
        .rowGap6 { display: flex; gap: 6px; align-items: center; }
        .fontSemibold { font-weight: 600; }
        .footer { margin-top: 12px; opacity: .9; }
        .mt8 { margin-top: 8px; }
        .mt4fs12 { margin-top: 4px; font-size: 12px; }
        .smallText { font-size: 12px; font-weight: 400; }
        .muted { opacity:.8 }
        .mono { font-variant-numeric: tabular-nums }
        .kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; border:1px solid var(--border); padding:2px 6px; border-radius:6px }
      `}</style>

      <div className="container">
        <header className="header">
          <h1 className="h1">
            <CustomIcon path={ICONS.cart} />
            <span>Leitor de Preços (nativo)</span>
            <span className="muted smallText">sem libs externas</span>
          </h1>
          <div className="row">
            <button className="button" onClick={() => setDark(v => !v)} title="Alternar tema">
              <CustomIcon path={dark ? ICONS.sun : ICONS.moon} /> {dark ? "Claro" : "Escuro"}
            </button>
            <button className="button" onClick={resetAll} title="Limpar listas">
              <CustomIcon path={ICONS.reset} /> Resetar
            </button>
            <button className="button" onClick={() => setShowDebug(v => !v)} title="Painel de debug">
              <CustomIcon path={ICONS.bug} /> Debug
            </button>
          </div>
        </header>

        {/* Tabs de modo */}
        <div className="row rowMt12" role="tablist" aria-label="Modo de captura">
          <button
            role="tab"
            aria-selected={scanMode === "camera"}
            onClick={() => setScanMode("camera")}
            className={`tab pill ${scanMode === "camera" ? "pillActive" : ""}`}
          >
            <CustomIcon path={ICONS.camera} /> Câmera
          </button>
          <button
            role="tab"
            aria-selected={scanMode === "manual"}
            onClick={() => setScanMode("manual")}
            className={`tab pill ${scanMode === "manual" ? "pillActive" : ""}`}
          >
            <CustomIcon path={ICONS.edit} /> Manual
          </button>
        </div>

        {/* Seção principal */}
        <main className="section">
          {scanMode === "camera" ? (
            <section className="card">
              <div className="flexBetweenWrap">
                <strong className="strongInline">
                  <CustomIcon path={ICONS.camera} /> Capturar rótulo
                </strong>
                <div className="row">
                  <CameraPreview onCapture={handleCapture} />
                  <small className="muted">Somente imagens reais serão enviadas para a API.</small>
                </div>
              </div>
              <div className="gridMt10">
                <label>
                  <span className="muted">Endpoint da API:</span>
                  <input className="input inputFull" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} />
                </label>
              </div>
            </section>
          ) : (
            <section className="card">
              <strong className="strongInline">
                <CustomIcon path={ICONS.edit} /> Adicionar manualmente
              </strong>
              <form onSubmit={handleManualAdd} className="row rowMt8">
                <input ref={inputNameRef} className="input inputFlex1" placeholder="Nome do produto" />
                <input ref={inputPriceRef} className="input inputW140" placeholder="Preço (ex: 12,90)" inputMode="decimal" />
                <button type="submit" className="button">Adicionar</button>
              </form>
            </section>
          )}

          {/* Lista de itens */}
          <section className="card">
            <div className="itemsHeader">
              <strong>Itens ({items.length})</strong>
              <span className="mono">Total: {currencyBRL(total)}</span>
            </div>
            <div className="list">
              {items.length === 0 && <div className="muted">Nenhum item ainda.</div>}
              {items.map(it => (
                <div key={it.id} className="item">
                  <div className="gridOnly">
                    <span className="fontSemibold">{it.name}</span>
                    <small className="muted">{it.source === "camera" ? "📸 câmera" : "✍️ manual"} • {new Date(it.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="row">
                    <span className="mono">{currencyBRL(it.price)}</span>
                    <button
                      className="button"
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
            <section className="card">
              <strong className="strongInline">
                <CustomIcon path={ICONS.bug} /> OCR / API Debug
              </strong>
              <div className="list">
                {apiResults.length === 0 && <div className="muted">Sem chamadas ainda.</div>}
                {apiResults.map(r => (
                  <div key={r.id} className="item itemStart">
                    <div className="gridGap4">
                      <div className="rowGap6">
                        <span className="kbd">{r.status}</span>
                        <small className="muted">{r.processingTime} ms</small>
                        <small className="muted">{r.apiEndpoint}</small>
                      </div>
                      <div className="muted">{r.responseText}</div>
                      <div>
                        <small className="muted">Preços detectados: </small>
                        <span className="mono">{r.detectedPrices.join(", ")}</span>
                      </div>
                      <div>
                        <small className="muted">Melhor preço: </small>
                        <strong className="mono">{r.bestPrice != null ? currencyBRL(r.bestPrice) : "—"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="muted mt8">
                Capturas bem-sucedidas: {successfulCaptures}/{apiResults.length} — {successRate.toFixed(0)}%
              </div>
            </section>
          )}
        </main>

        <footer className="footer">
          <p>
            {scanMode === "camera"
              ? "📸 Sistema de captura: selecione uma imagem real e simulamos o envio para a sua API via POST/PUT."
              : "✍️ Modo Manual: digite manualmente os produtos e preços."}
          </p>
          {scanMode === "camera" && apiResults.length > 0 && (
            <p className="mt4fs12">
              📊 Estatísticas API: {successfulCaptures}/{apiResults.length} capturas bem-sucedidas
              ({successRate.toFixed(0)}% de sucesso) — Apenas fotos reais enviadas para API
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // Extract base64 part after the data URI prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

