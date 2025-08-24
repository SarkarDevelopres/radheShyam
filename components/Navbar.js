import React, { useEffect, useState, useRef } from 'react'
import styles from "./styles/navbar.module.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { TbCoinRupee } from "react-icons/tb";
import { io } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;

function Navbar() {
  const [tokenExists, setTokenExists] = useState(false);
  const [balance, setBalance] = useState(null);
  const pathName = usePathname();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  // init socket
  useEffect(() => {
    const s = io(SERVER_URL);
    socketRef.current = s;
    const fetchNow = () => {
      const uid = "689ed0deca58facca988473c";
      if (!uid) return;
      s.emit("wallet:fetch", { userId: uid }, (res) => {
        if (res?.ok) setBalance(Number(res._doc.balance) || 0);
      });
    };

    s.on("connect", fetchNow);
    s.on("bet:place", fetchNow); // refresh when result lands
    s.on("round:result", fetchNow); // refresh when result lands

    return () => {
      s.off("connect", fetchNow);
      s.off("round:result", fetchNow);
      s.disconnect();
    };
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("userToken");
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
        <Link href="/sports">In-Play</Link>
        <Link href="/games">Games</Link>
        {tokenExists ? (
          <div className={styles.balanceSpan}>
            <TbCoinRupee />
            <span>{balance}</span>
          </div>
        ) : (
          <Link href="/login" className={styles.btn}>Log In</Link>
        )}
      </div>
    </div>
  )
}

export default Navbar;
