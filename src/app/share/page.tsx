'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Share2, MessageCircle, Send, Link2 } from "lucide-react";
import { useActiveList } from "../hooks/useShoppingList";
import { useRouter } from "next/navigation";
import { Button } from "../components/UI/Button";
import style from "./page.module.scss";

const ShareList = () => {
  const router = useRouter();
  const { activeList } = useActiveList();
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    if (!activeList) return "";
    const lines = activeList.items.map((item) => {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : "";
      const price = item.price ? ` — R$ ${item.price}` : "";
      const check = item.checked ? "✅" : "⬜";
      return `${check} ${qty}${item.name}${price}`;
    });

    const total = activeList.items.reduce((sum, i) => {
      if (!i.price) return sum;
      const n = parseFloat(i.price.replace(/[^\d,.-]/g, "").replace(",", "."));
      return isNaN(n) ? sum : sum + n * i.quantity;
    }, 0);

    let text = `🛒 *${activeList.name}*\n\n${lines.join("\n")}`;
    if (total > 0) {
      text += `\n\n💰 Total: R$ ${total.toFixed(2).replace(".", ",")}`;
    }
    text += "\n\n— Enviado via Cestri, sua cesta inteligente! 🧠🛍️";
    return text;
  };

  const listText = generateText();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(listText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(listText)}`, "_blank");
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?text=${encodeURIComponent(listText)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: activeList?.name || "Lista", text: listText });
    }
  };

  if (!activeList) {
    return (
      <div className={style.emptyPage}>
        <Share2 className={style.emptyIcon} />
        <p className={style.emptyText}>Nenhuma lista ativa para compartilhar</p>
        <Button variant="outline" onClick={() => router.push("/")}>Voltar</Button>
      </div>
    );
  }

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
          COMPARTILHAR
        </h1>
      </div>

      <div className={style.content}>
        {/* List name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={style.listInfoRow}
        >
          <div className={style.listInfoIconWrap}>
            <Share2 className={style.listInfoIcon} />
          </div>
          <div>
            <p className={style.listName}>{activeList.name}</p>
            <p className={style.listCount}>{activeList.items.length} itens</p>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={style.previewCard}
        >
          <p className={style.sectionLabel}>
            Prévia
          </p>
          <pre className={style.previewText}>
            {listText}
          </pre>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={style.shareSection}
        >
          <p className={style.sectionLabel}>
            Enviar via
          </p>

          <div className={style.channelGrid}>
            <button
              onClick={handleWhatsApp}
              className={style.whatsappButton}
            >
              <MessageCircle className={style.channelIcon} />
              <span className={style.channelLabel}>WhatsApp</span>
            </button>

            <button
              onClick={handleTelegram}
              className={style.telegramButton}
            >
              <Send className={style.channelIcon} />
              <span className={style.channelLabel}>Telegram</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={style.neutralActionButton}
          >
            {copied ? (
              <>
                <Check className={style.copiedIcon} />
                <span className={style.copiedText}>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className={style.actionIcon} />
                <span className={style.actionText}>Copiar Texto</span>
              </>
            )}
          </button>

          {"share" in navigator && (
            <button
              onClick={handleNativeShare}
              className={style.neutralActionButton}
            >
              <Link2 className={style.actionIcon} />
              <span className={style.actionText}>Mais opções...</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ShareList;
