import React, { useEffect } from "react";
import style from "./style.module.scss";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`${style.overlay} ${isOpen ? style.show : ""}`}
        onClick={onClose}
      />

      <aside className={`${style.sideMenu} ${isOpen ? style.open : ""}`}>
        {children}
      </aside>
    </>
  );
};

export default SideMenu;