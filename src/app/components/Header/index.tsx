'use client';

import { useState } from "react";
import SideMenu from "../SideMenu";
import style from "./style.module.scss";


const Header = () => {

  const [open, setOpen] = useState(false);
  return (
    <header className={style.header}>
      <div>
        <button className={style.menuButton} onClick={() => setOpen(true)}>
          ☰
        </button>
      </div>
      <div className={style.logo}>
        <h1>Cestri</h1>
        <span>Sua cesta, agora inteligente!</span>
      </div>
      <div className={style.headerOptions}>
        ...
      </div>

      <SideMenu isOpen={open} onClose={() => setOpen(false)}>
        <h2>Menu</h2>
        <nav style={{ marginTop: 20 }}>
          <a href="/">Inicio</a>
          <br />
          <a href="/wishlist">Lista de Compras</a>
          <br />
          {/* <a href="#">Configurações</a> */}
        </nav>
      </SideMenu>
    </header>
  );
}
export default Header;