import React, { useEffect, useState } from 'react'
import styles from "./styles/navbar.module.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { TbCoinRupee } from "react-icons/tb";

function Navbar() {
  const [tokenExists, setTokenExists] = useState(false);
  const [balance, setBalance] = useState(null);
  const pathName = usePathname();

  const checkBalance = async (token) => {
    console.log(token);
    
    let req = await fetch(`/api/data/balance`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'  // or other content type if needed
    },
      body: JSON.stringify({
        "token": token,
      })
    });
    
    let res = await req.json();
    console.log(res);
    if (res.success) {
      setBalance(res.data.balance)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("userToken");
      setTokenExists(!!token);
      checkBalance(token)
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
        {/* <button className={styles.btn} onClick={logOut}>Log Out</button> */}
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

export default Navbar
