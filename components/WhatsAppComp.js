import React from 'react'
import styles from "./styles/whatsapp.module.css"
import Link from 'next/link'
function WhatsAppComp() {
  return (
    <Link className={styles.mainDiv} href='https://wa.me/917001809047/' target="_blank">
        <img src='/whatsapp-icon.png'/>
    </Link>
  )
}

export default WhatsAppComp