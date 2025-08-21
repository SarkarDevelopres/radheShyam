"use client"
import React, { useEffect, useState } from 'react'
import { IoPersonOutline } from "react-icons/io5";
import styles from "./styles/menuWindow.module.css"
import { FaPowerOff } from "react-icons/fa6";
import { useRouter, usePathname } from 'next/navigation';
function MenuWindow({ onClose }) {
    const pathName = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState({ name: "Sagnik Sarkar" })
    const [tokenExists, setTokenExists] = useState(false);

    const logOut = () => {
        const confirmed = confirm("Are you sure you want to Log-Out");
        if (confirmed) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("balance");
            window.location.replace("/");
        }
    }

        const goToLogin = () => {
            onClose();
            router.push('/login');
        }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("userToken");
            setTokenExists(!!token);
        }
    }, [pathName]);

    return (
        <div className={styles.mainWindow}>
            <div className={styles.sideMenu}>
                <div className={styles.menuHead}>
                    <IoPersonOutline />
                    <h3>{userData.name}</h3>
                </div>
                <div className={styles.menuBody}>
                    {
                        tokenExists?(
                            <button onClick={logOut}><FaPowerOff />Log-Out</button>
                        ):(
                            <button onClick={()=>goToLogin()}>Log-In</button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default MenuWindow