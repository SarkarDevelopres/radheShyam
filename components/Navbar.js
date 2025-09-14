import React, { useEffect, useState, useRef } from 'react'
import styles from "./styles/navbar.module.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { TbCoinRupee } from "react-icons/tb";
import { io } from "socket.io-client";
import { toast } from 'react-toastify';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;

function Navbar() {
  const [tokenExists, setTokenExists] = useState(false);
  const [balance, setBalance] = useState(null);
  const pathName = usePathname();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const balanceRef = useRef(null);
  const [isUser, setIsUser] = useState(false)
  // init socket

  const logOut = () => {
    localStorage.clear();
    window.location.replace("/login");
  }

  useEffect(() => {
    const user = localStorage.getItem("userToken");
    if (!user) return;

    setIsUser(true);
    // console.log(user);

    const s = io(SERVER_URL, { auth: { token: user } });
    socketRef.current = s;

    const fetchNow = () => {
      s.emit("wallet:fetch", { userId: user }, (res) => {
        console.log(res);
        if (res.ok == false) {
          toast.error("Sessiopn expired login again!");
          setTimeout(() => {
            logOut()
          }, 1000);
        }

        if (res?.ok) setBalance(Number(res._doc.balance).toFixed(2) || 0);
      });
    };

    fetchNow();
    s.on("connect", fetchNow);
    s.on("wallet:update", (res) => {
      console.log("Results: ", res);
      console.log("Results Came: ", res._doc.balance);

      if (res?.ok) setBalance(Number(res._doc.balance).toFixed(2) || 0);
    });

    return () => {
      s.off("connect", fetchNow);
      s.off("wallet:update");
      s.disconnect();
    };
  }, []);



  useEffect(() => {
    if (typeof window !== 'undefined') {
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

export default Navbar;
