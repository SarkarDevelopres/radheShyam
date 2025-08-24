"use client"
import React, { useState } from "react";
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import WhatsAppComp from "./WhatsAppComp";
import Footer from "./Footer";
import MenuWindow from "./MenuWindow";
import { ToastContainer, Bounce } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

function ClientShell({ children }) {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover = {false}
        theme="colored"
        transition={Bounce} />
      <WhatsAppComp />
      {children}
      {menuOpen && (<MenuWindow onClose={() => setMenuOpen(false)} />)}
      <MobileNav onMenuClick={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} />
      <Footer />
    </>
  )
}

export default ClientShell