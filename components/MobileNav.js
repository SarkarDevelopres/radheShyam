"use client"
import React, { useRef, useState } from 'react'
import styles from './styles/mobileNav.module.css'
import { FaHome, FaCoins } from "react-icons/fa";
import { TbPlayCard } from "react-icons/tb";
import { CgCardHearts } from "react-icons/cg";
import { IoMenu } from "react-icons/io5";
import { useRouter } from 'next/navigation';

function MobileNav({onMenuClick,onClose}) {
    const [currentTab, setCurrentTab] = useState("Home")
    const router = useRouter();
    const cap = useRef(null);

    const handleChange = (name) => {
        setCurrentTab(name);
        if (name == "Home") {
            cap.current.style.left = "0%";
            onClose();
            router.push("/")
        }
        else if (name == "In-Play") {
            cap.current.style.left = "25%";
            onClose();
            router.push("/sports")
        }
        else if (name == "Games") {
            cap.current.style.left = "50%";
            onClose();
            router.push("/games")

        }
        else {
            cap.current.style.left = "75%";
            onMenuClick();

        }
    }
    return (
        <div className={styles.mainDiv}>
            <span className={styles.capsule} ref={cap} ></span>
            <div className={styles.navLinksList}>
                <div>
                    {
                        currentTab == "Home" ? (
                            <span>Home</span>
                        ) : (
                            <FaHome onClick={() => handleChange("Home")} />
                        )
                    }
                </div>
                <div>
                     {
                        currentTab == "In-Play" ? (
                            <span>In-Play</span>
                        ) : (
                            <FaCoins onClick={() => handleChange("In-Play")} />
                        )
                    }
                </div>
                <div>
                     {
                        currentTab == "Games" ? (
                            <span>Games</span>
                        ) : (
                            <TbPlayCard onClick={() => handleChange("Games")} />
                        )
                    }
                </div>
                <div>
                     {
                        currentTab == "Menu" ? (
                            <span>Menu</span>
                        ) : (
                            <IoMenu onClick={() => handleChange("Menu")} />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default MobileNav