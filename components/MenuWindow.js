"use client"
import React, { useEffect, useState, useRef } from 'react'
import { IoPersonOutline } from "react-icons/io5";
import styles from "./styles/menuWindow.module.css"
import { FaPowerOff } from "react-icons/fa6";
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { io } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;

function MenuWindow({ onClose }) {
    const pathName = usePathname();
    const router = useRouter();
    const socketRef = useRef(null);
    const balanceRef = useRef(null);
    const [balance, setBalance] = useState(null);
    const [userData, setUserData] = useState({ name: "User Name" })
    const [tokenExists, setTokenExists] = useState(false);
    const [changePasswordWindow, setChangePasswordWindow] = useState(false);
    const [oldpassword, setoldpassword] = useState("");
    const [newpassword, setnewpassword] = useState("");
    const [profitLoss, setProfitLoss] = useState(0);

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
            const profitLossData = localStorage.getItem("balance");
            setProfitLoss(profitLossData)
            setTokenExists(!!token);
            setUserData({ name: !userName ? "User Name" : userName })
        }
    }, [pathName]);

    useEffect(() => {

        const user = localStorage.getItem("userToken");
        if (!user) return;
        const s = io(SERVER_URL, { auth: { token: user } });
        socketRef.current = s;

        const fetchNow = () => {
            s.emit("exp:fetch", { userId: user }, (res) => {
                console.log(res);
                if (res.ok == false) {
                    toast.error("Sessiopn expired login again!");
                    setTimeout(() => {
                        logOut()
                    }, 1000);
                }

                if (res?.ok) setProfitLoss(Number(res._doc.balance).toFixed(2) || 0);
            });
        }

        fetchNow();
        s.on("connect", fetchNow);
        s.on("exp:update", (res) => {
            console.log("Results: ", res);
            console.log("Results Came: ", res._doc.balance);
            if (res?.ok) {
                setProfitLoss(Number(res.balance).toFixed(2) || 0);

                if (res.type === "bet_win" && res.amount > 0) {
                    toast.success(`🎉 You won ₹${res.amount}!`);
                } else if (res.type === "bet_loss" && res.amount < 0) {
                    toast.error(`❌ You lost ₹${Math.abs(res.amount)}`);
                }
            }

            if (res?.ok) setProfitLoss(Number(res._doc.balance).toFixed(2) || 0);
        });

        return () => {
            s.off("connect", fetchNow);
            s.off("wallet:update");
            s.disconnect();
        };
    }, []);

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
                <div className={styles.profitLossDiv}>
                    <p>P&L:</p>
                    {profitLoss >= 0 ? <span style={{ color: "rgba(0, 243, 0, 1)" }} className={styles.profitLossData} ref={balanceRef}>{profitLoss}</span> : <span style={{ color: "red" }} className={styles.profitLossData} ref={balanceRef}>{profitLoss}</span>}
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