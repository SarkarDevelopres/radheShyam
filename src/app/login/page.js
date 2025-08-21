"use client"
import React, { use, useState } from 'react'
import { useRouter } from 'next/navigation';
import styles from './login.module.css'

function page() {
    const router = useRouter();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        if (!userName || !password) {
            alert("Enter Credentials");
        }
        let req = await fetch(`${process.env.NEXT_PUBLIC_PORT}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // or other content type if needed
            },
            body: JSON.stringify({
                "username": userName,
                "password": password
            })
        });
        let res = await req.json();

        if (res.success) {
            localStorage.setItem("userToken", res.token);
            localStorage.setItem("balance", res.balance);
            window.location.replace("/");
        } else {
            alert(res.message);
            router.refresh();
        }
    }

    return (
        <div className={styles.mainDiv}>
            <div className={styles.loginBox}>
                <h2>Welcome !</h2>
                <div className={styles.inputFields}>
                    <input
                        placeholder='Enter Username'
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        placeholder='Enter Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type='password'
                    />
                    <button onClick={login}>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default page