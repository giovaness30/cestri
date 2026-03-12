'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, DollarSign, Trash2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "../components/UI/Switch";
import style from "./page.module.scss";

const CURRENCY_OPTIONS = [
  { value: "BRL", label: "R$ — Real Brasileiro" },
  { value: "USD", label: "$ — Dólar Americano" },
  { value: "EUR", label: "€ — Euro" },
];

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("cestri-settings") || "{}");
  } catch {
    return {};
  }
}

function saveSettings(s: Record<string, unknown>) {
  localStorage.setItem("cestri-settings", JSON.stringify(s));
}

const Settings = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, unknown>>(loadSettings);

  const darkMode = settings.darkMode === true;
  const currency = (settings.currency as string) || "BRL";
  const confirmDelete = settings.confirmDelete !== false;

  useEffect(() => saveSettings(settings), [settings]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const update = (key: string, value: unknown) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleClearAll = () => {
    if (window.confirm("Tem certeza? Isso apagará TODAS as listas e configurações.")) {
      localStorage.removeItem("shopping-lists");
      localStorage.removeItem("active-list-id");
      localStorage.removeItem("cestri-settings");
      window.location.reload();
    }
  };

  return (
    <div className={style.page}>
      {/* Header */}
      <div className={style.header}>
        <button
          onClick={() => router.push("/")}
          className={style.backButton}
        >
          <ArrowLeft className={style.backIcon} />
        </button>
        <h1 className={style.title}>
          CONFIGURAÇÕES
        </h1>
      </div>

      <div className={style.content}>
        {/* Appearance */}
        <Section title="Aparência" delay={0}>
          <Row
            icon={darkMode ? <Moon className={style.optionIcon} /> : <Sun className={style.optionIcon} />}
            label="Modo escuro"
            description="Muda a interface para tema escuro"
          >
            <Switch checked={darkMode} onCheckedChange={(v) => update("darkMode", v)} />
          </Row>
        </Section>

        {/* Currency */}
        <Section title="Moeda" delay={0.05}>
          {CURRENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("currency", opt.value)}
              className={`${style.currencyButton} ${currency === opt.value ? style.currencyButtonActive : style.currencyButtonInactive
                }`}
            >
              <DollarSign className={style.currencyIcon} />
              <span className={style.currencyLabel}>
                {opt.label}
              </span>
              {currency === opt.value && (
                <div className={style.currencyDot} />
              )}
            </button>
          ))}
        </Section>

        {/* Preferences */}
        <Section title="Preferências" delay={0.1}>
          <Row
            icon={<Trash2 className={style.optionIcon} />}
            label="Confirmar exclusão"
            description="Pedir confirmação ao deletar itens"
          >
            <Switch
              checked={confirmDelete}
              onCheckedChange={(v) => update("confirmDelete", v)}
            />
          </Row>
        </Section>

        {/* Danger zone */}
        <Section title="Dados" delay={0.15}>
          <button
            onClick={handleClearAll}
            className={style.dangerButton}
          >
            <Trash2 className={style.dangerIcon} />
            <div className={style.dangerTextWrap}>
              <span className={style.dangerTitle}>Apagar todos os dados</span>
              <span className={style.dangerDesc}>Remove listas, itens e configurações</span>
            </div>
          </button>
        </Section>

        {/* About */}
        <Section title="Sobre" delay={0.2}>
          <Row
            icon={<Info className={style.optionIcon} />}
            label="Cestri"
            description="v0.0.1 — Sua Cesta - agora Inteligente! Descubra o poder da IA para otimizar suas compras"
          />
        </Section>
      </div>
    </div>
  );
};

function Section({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={style.section}
    >
      <p className={style.sectionTitle}>
        {title}
      </p>
      <div className={style.sectionCard}>
        {children}
      </div>
    </motion.div>
  );
}

function Row({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={style.row}>
      <div className={style.rowIconWrap}>{icon}</div>
      <div className={style.rowBody}>
        <span className={style.rowLabel}>{label}</span>
        {description && (
          <span className={style.rowDesc}>{description}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export default Settings;
