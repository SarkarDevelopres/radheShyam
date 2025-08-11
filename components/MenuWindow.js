"use client"
import React, { useState } from 'react'
import { IoPersonOutline } from "react-icons/io5";
import styles from "./styles/menuWindow.module.css"
function MenuWindow({ onClose }) {
    const [userData, setUserData] = useState({ name: "Sagnik Sarkar" })
    return (
        <div className={styles.mainWindow}>
            <div className={styles.sideMenu}>
                <div className={styles.menuHead}>
                    <IoPersonOutline />
                    <h3>{userData.name}</h3></div>
            </div>
        </div>
    )
}

export default MenuWindow