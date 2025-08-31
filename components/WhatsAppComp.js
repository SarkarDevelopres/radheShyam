"use client"
import React, { useEffect, useState } from 'react'
import styles from "./styles/whatsapp.module.css"
import Link from 'next/link'
function WhatsAppComp({no}) {

  return (
    <Link className={styles.mainDiv} href={`https://wa.me/${no}/`} target="_blank">
      <img src='/whatsapp-icon.png' />
    </Link>
  )
}

export default WhatsAppComp