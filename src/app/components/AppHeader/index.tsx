import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  List,
  BarChart3,
  Tags,
  MapPin,
  Bell,
  Settings,
  Share2,
  ShoppingBasket

} from "lucide-react";
import { useRouter } from "next/navigation";
import style from "./style.module.scss";

const menuItems = [
  { icon: List, label: "Minhas Listas", path: "/lists", ready: true },
  { icon: BarChart3, label: "Comparar Preços", path: "/compare", ready: true },
  { icon: Tags, label: "Ofertas & Promoções", path: "/deals", ready: false },
  { icon: MapPin, label: "Mercados Próximos", path: "/stores", ready: false },
  { icon: Bell, label: "Alertas de Preço", path: "/alerts", ready: false },
  { icon: Share2, label: "Compartilhar Lista", path: "/share", ready: true },
  { icon: Settings, label: "Configurações", path: "/settings", ready: true },
];

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const location = typeof window !== "undefined" ? window.location : null;

  const handleNav = (path: string, ready: boolean) => {
    if (ready) {
      router.push(path);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className={style.header}>
        <div className={style.brand}>
          <ShoppingBasket className={style.brandIcon} />
          <span className={style.brandText}>
            Cestr<span className={style.brandAccent}>i</span>
          </span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={style.menuToggle}
        >
          {menuOpen ? (
            <X className={style.menuToggleIcon} />
          ) : (
            <Menu className={style.menuToggleIcon} />
          )}
        </button>
      </header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={style.backdrop}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={style.dropdown}
            >
              <div className={style.menuList}>
                {menuItems.map((item) => {
                  const active = location?.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path, item.ready)}
                      className={`${style.menuItem} ${active ? style.menuItemActive : item.ready ? style.menuItemReady : style.menuItemDisabled
                        }`}
                    >
                      <item.icon className={style.menuItemIcon} />
                      <span className={style.menuItemLabel}>
                        {item.label}
                      </span>
                      {!item.ready && (
                        <span className={style.soonBadge}>
                          EM BREVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppHeader;
