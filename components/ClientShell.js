"use client"
import React, { useState } from "react";
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import WhatsAppComp from "./WhatsAppComp";
import Footer from "./Footer";
import MenuWindow from "./MenuWindow";

function ClientShell({children}) {
    
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
        <Navbar/>
        <WhatsAppComp />
        {children}
        {menuOpen && (<MenuWindow onClose={() => setMenuOpen(false)} />)}
        <MobileNav onMenuClick={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} />
        <Footer/>
    </>
  )
}

export default ClientShell