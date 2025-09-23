import React, { useEffect, useState, useRef } from 'react'
import styles from "./styles/navbar.module.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { TbCoinRupee } from "react-icons/tb";
import { toast } from 'react-toastify';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;

function EmpNavbar({ maintainance }) {
  const [tokenExists, setTokenExists] = useState(false);
  const pathName = usePathname();
  const balanceRef = useRef(null);
  const [isUser, setIsUser] = useState(false)
  // init socket

  const logOut = () => {
    localStorage.clear();
    window.location.replace("/login");
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !maintainance) {
      const token = localStorage.getItem("adminToken");
      setTokenExists(!!token);
    }
  }, [pathName]);

  return (
    <div className={styles.mainDiv}>
      <div className={styles.navbarLogo}>
        <img src='/main-logo.png' />
        <div className={styles.appName}>
          <h2>RadheShyam</h2>
          <h2>Exchange</h2>
        </div>
      </div>
      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        <Link href="/live">In-Play</Link>
        <Link href="/sports">Sports</Link>
        <Link href="/games">Games</Link>
        {isUser ? (
          <div className={styles.balanceSpan}>
            <TbCoinRupee />
            <span ref={balanceRef}>{balance}</span>
          </div>
        ) : (
          tokenExists ? <Link href='/admin'>Profile</Link> : <Link href="/login" className={styles.btn}>Log In</Link>
        )}
      </div>
    </div>
  )
}

export default EmpNavbar;
