import Link from 'next/link'
import React from 'react'
import styles from "./styles/footer.module.css"
function Footer() {
  return (
    <div className={styles.footerMain}>
        <p>You must be over 18 years old, or the legal age at which gambling or gaming activities are allowed under the law or jurisdiction that applies to you. </p>
        <div className={styles.logoNav}>
            <img src='/main-logo.png' />
            <div className={styles.footerNav}>
                <Link href="/">Home</Link>
                <Link href="/games">Games</Link>
                <Link href="/sports">In-Play</Link>
                <Link href="/login">Log-In</Link>
                <Link href="/login">Admin</Link>
            </div>
        </div>
        <p className={styles.copyrightPara}>Copyright@RadheShyamExchange 2025</p>
    </div>
  )
}

export default Footer