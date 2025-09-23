"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import styles from '@/(main)/login/login.module.css'

function EmpLogin() {
    const router = useRouter();

    const [empId, setEmpId] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        if (!empId || !password) {
            alert("Enter Credentials");
        }
        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/auth/empLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // or other content type if needed
            },
            body: JSON.stringify({
                "empId": empId,
                "password": password
            })
        });
        let res = await req.json();

        if (res.success) {
            localStorage.setItem("empToken", res.token);
            localStorage.setItem("empId", res.empId);
            window.location.replace("/employee");
        } else {
            alert(res.message);
            router.refresh();
        }
    }

    return (
        <div className={styles.mainDiv}>
            <div className={styles.loginBox}>
                <h2>Welcome There !</h2>
                <div className={styles.inputFields}>
                    <input
                        placeholder='Enter Employee ID'
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
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

export default EmpLogin
