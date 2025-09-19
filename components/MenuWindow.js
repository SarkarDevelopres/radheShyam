"use client"
import React, { useEffect, useState } from 'react'
import { IoPersonOutline } from "react-icons/io5";
import styles from "./styles/menuWindow.module.css"
import { FaPowerOff } from "react-icons/fa6";
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

function MenuWindow({ onClose }) {
    const pathName = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState({ name: "User Name" })
    const [tokenExists, setTokenExists] = useState(false);
    const [changePasswordWindow, setChangePasswordWindow] = useState(false);
    const [oldpassword, setoldpassword] = useState("");
    const [newpassword, setnewpassword] = useState("");

    const logOut = () => {
        const confirmed = confirm("Are you sure you want to Log-Out");
        if (confirmed) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("balance");
            window.location.replace("/");
        }
    }

    const changePassword = async () => {
        let userToken = localStorage.getItem('userToken');
        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/user/chngpassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"  // send token in header
            },
            body: JSON.stringify({
                "usertoken": userToken,
                "newpassword": newpassword,
                "oldpassword": oldpassword,
            })
        });
        let res = await req.json();

        if (res.ok) {
            toast.success(`${res.message}`);
        }
        else {
            toast.error(`${res.message}`);
        }
    }

    const goToLogin = () => {
        onClose();
        router.push('/login');
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("userToken");
            const userName = localStorage.getItem("userName");
            setTokenExists(!!token);
            setUserData({ name: !userName ? "User Name" : userName })
        }
    }, [pathName]);

    return (
        <div className={styles.mainWindow}>
            {
                changePasswordWindow &&
                <div className={styles.passwordWindow}>
                    <input value={oldpassword} onChange={(e) => setoldpassword(e.target.value)} placeholder='type old password' />
                    <input value={newpassword} onChange={(e) => setnewpassword(e.target.value)} placeholder='type new password' />
                    <div className={styles.btnDiv}>
                        <button onClick={changePassword}>Change Password</button>
                        <button onClick={() => {
                            setChangePasswordWindow(false);
                            setnewpassword('');
                            setoldpassword('');
                        }
                        }>Close</button>
                    </div>
                </div>
            }
            <div className={styles.sideMenu}>
                <div className={styles.menuHead}>
                    <IoPersonOutline />
                    <h3>{userData.name}</h3>
                </div>
                <div className={styles.menuBody}>
                    {
                        tokenExists ? (
                            <>
                                <button onClick={() => setChangePasswordWindow(true)}>Change password</button>
                                <button onClick={logOut}><FaPowerOff />Log-Out</button>
                            </>
                        ) : (
                            <button onClick={() => goToLogin()}>Log-In</button>
                        )
                    }
                </div>

            </div>
        </div>
    )
}

export default MenuWindow