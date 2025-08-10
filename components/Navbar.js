import React from 'react'
import styles from "./styles/navbar.module.css"
import Link from 'next/link'

function Navbar() {
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
        <button>Log In</button>
      </div>
    </div>
  )
}

export default Navbar