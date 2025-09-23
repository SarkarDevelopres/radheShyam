"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import styles from '../../login/login.module.css'

function AdminLogin() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        if (!email || !password) {
            alert("Enter Credentials");
        }
        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/auth/adminLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // or other content type if needed
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        });
        let res = await req.json();

        if (res.success) {
            localStorage.setItem("adminToken", res.token);
            window.location.replace("/admin");
        } else {
            alert(res.message);
            router.refresh();
        }
    }

    return (
        <div className={styles.mainDiv}>
            <div className={styles.loginBox}>
                <h2>Welcome Admin !</h2>
                <div className={styles.inputFields}>
                    <input
                        placeholder='Enter Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

export default AdminLogin
