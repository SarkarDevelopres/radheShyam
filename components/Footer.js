import Link from 'next/link'
import React from 'react'
import styles from "./styles/footer.module.css"
function Footer({ maintainance }) {
  let navLinks = (<div className={styles.footerNav}>
          <Link href="/">Home</Link>
          <Link href="/games">Games</Link>
          <Link href="/sports">In-Play</Link>
          <Link href="/login">Log-In</Link>
          <Link href="/employee/login">Emp Log-In</Link>
        </div>)
  let maintainanceNavLinks = (<div className={styles.footerNav}>
          <Link href="/">Home</Link>
          <Link href="/">Games</Link>
          <Link href="/">In-Play</Link>
          <Link href="/">Log-In</Link>
          <Link href="/">Emp Log-In</Link>
        </div>)
  return (
    <div className={styles.footerMain}>
      <p>You must be over 18 years old, or the legal age at which gambling or gaming activities are allowed under the law or jurisdiction that applies to you. </p>
      <div className={styles.logoNav}>
        <img src='/main-logo.png' />
        {maintainance ? maintainanceNavLinks : navLinks}
      </div>
      <p className={styles.copyrightPara}>Copyright@RadheShyamExchange 2025</p>
    </div>
  )
}

export default Footer