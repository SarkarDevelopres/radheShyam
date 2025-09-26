"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from './admin.module.css'
import { MdPersonOutline, MdInstallMobile } from "react-icons/md";
import { toast } from 'react-toastify';
import { IoGameControllerOutline } from "react-icons/io5";
import { BsCashCoin } from "react-icons/bs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
ChartJS.register(
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale,
    BarElement, Title,
    PointElement, LineElement
);

import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';

export function LastGameComponent({ index, type, players, fee }) {
    const [normalDate, setNormalDate] = useState("");

    useEffect(() => {
        setNormalDate(new Date(fee).toLocaleDateString());
    }, [fee]);

    const concatedGameName = type.slice(0, 6);
    return (
        <tr className={styles.gameCompDiv} style={{ borderBottom: "1px solid rgb(255,255,255,0.1)" }}>
            <td>{index + 1}</td>
            <td>{concatedGameName}</td>
            <td>{players}</td>
            <td>{normalDate || "..."}</td>
        </tr>
    );
}

export function LastTransactionComponent({ id, index, user, amount }) {
    return (
        <tr className={styles.gameCompDiv} style={{ borderBottom: "1px solid rgb(255,255,255,0.1)" }}>
            <td>{index + 1}</td>
            <td className={styles.gameCompData}>{id}</td>
            <td className={styles.gameCompData}>{user}</td>
            <td className={styles.gameCompData}>{-amount}</td>
        </tr>
    )
}


function Admin() {
    const [totaltypes, setTotaltypes] = useState(4)
    const [activeGames, setActiveGames] = useState(5)
    const [revenueToday, setRevenueToday] = useState(4562)
    const [whatsAppNo, setWhatsAppNo] = useState()
    const [lastGames, setLastGames] = useState([])
    const [lastTransaction, setLastTransaction] = useState([])
    const router = useRouter();

    const fetchGameLogs = async () => {
        try {
            if (typeof window === "undefined") return; // prevent SSR
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/latestFiveGameLogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,
                },
            });

            const data = await res.json();
            setLastGames([...data.rounds]);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    const fetchTransLogs = async () => {
        try {
            if (typeof window === "undefined") return; // prevent SSR
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/latestTransactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(data.rounds);
            setLastTransaction([...data.trans]);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }
    const fetchTotalGames = async () => {
        try {
            if (typeof window === "undefined") return; // prevent SSR
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/totalGames`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(data.rounds);
            setActiveGames(data.totalGames);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }
    const fetchTotalUsers = async () => {
        try {
            if (typeof window === "undefined") return; // prevent SSR
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/totalGames`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(data.rounds);
            // setActiveGames(data.totalUser);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }
    const fetchTransactionAmount = async () => {
        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/todayTransactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(data.rounds);
            setRevenueToday(data.totalAmount);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }

    const fecthWhatsapp = async () => {
        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/getNum`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(data.rounds);
            setWhatsAppNo(data.data.phone);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }

    const changeWhastapp = async () => {

        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) throw new Error("No admin token found");
        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/chngWhatsapp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                "phone": parseInt(whatsAppNo)
            })
        });

        const res = await req.json();
        if (res.ok) {
            toast.success(`${res.message}`);
            router.refresh();
        }
        else {
            toast.error(`${res.message}`)
        }
        console.log(res);
    }


    useEffect(() => {
        fetchGameLogs()
        fetchTransLogs()
        fetchTotalGames()
        fetchTotalUsers()
        fetchTransactionAmount()
        fecthWhatsapp()
    }, [])


    const pieData = {
        labels: ['Referral', 'In-Game', 'Purchases'],
        datasets: [
            {
                data: [12, 20, 50],
                backgroundColor: ['rgb(2, 73, 81)', 'rgb(0, 56, 100)', 'rgb(54 174 233)'],
                borderWidth: 0
            },
        ],
    };
    const lineData = {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Sales',
                data: [0, 0, 0, 1, 2],
                borderColor: '#36A2EB',
                fill: true,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#fff',   // Custom legend label color
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    padding: 20
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)' // X-axis grid lines
                },
                ticks: {
                    color: '#ccc' // optional: axis text color
                }
            },
            y: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)' // Y-axis grid lines
                },
                ticks: {
                    color: '#ccc'
                }
            }
        }
    };

    const barData = {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Data Used in MB',
                data: [0, 0, 0, 10, 38],
                backgroundColor: ['rgb(2, 73, 81)', 'rgb(0, 56, 100)', 'rgb(54 174 233)', 'rgb(90 104 233)', 'rgb(5 80 150)'],
            },
        ],
    };
    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"home"} />
            <div className={styles.adminMainContent}>
                <h2>Welcome Sir,</h2>
                <div className={styles.dataCardList}>
                    <div className={styles.dataCard}>
                        <IoGameControllerOutline className={styles.dataIcon} />
                        <div className={styles.dataDetails}>
                            <p>Played Games</p>
                            <h3>{activeGames}</h3>
                        </div>
                    </div>
                    <div className={styles.dataCard}>
                        <BsCashCoin className={styles.dataIcon} />
                        <div className={styles.dataDetails}>
                            <p>{`Revenue Today`}</p>
                            <h3>{revenueToday}</h3>
                        </div>
                    </div>
                    <div className={styles.dataCard}>
                        <div className={styles.dataDetails}>
                            <p>{`Whatsapp No.`}</p>
                            <div className={styles.noField}>
                                <input value={whatsAppNo} onChange={(e)=>setWhatsAppNo(e.target.value)} />
                                <button onClick={changeWhastapp}>Change</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.graphZone}>
                    <div className={styles.graphDiv}>
                        <Line data={lineData} options={options} />
                    </div>
                    <div className={styles.graphDiv}>
                        <Pie data={pieData} options={{ ...options, cutout: '50%' }} />
                    </div>
                </div>
                <div className={styles.historyZone}>
                    <div className={styles.lastDataListDiv}>
                        <h3>Last Games Played</h3>
                        <div className={styles.gameCompDiv} style={{ backgroundColor: "#231a2b" }}>
                            <span className={styles.gameCompData}>Sl No</span>
                            <span className={styles.gameCompData}>GameName</span>
                            <span className={styles.gameCompData}>Status</span>
                            <span className={styles.gameCompData}>Date</span>
                        </div>
                        <table className={styles.historyTable}>
                            {
                                lastGames.map((e, index) => {
                                    return <LastGameComponent key={e.tableId} index={index} type={e.game} players={e.status} fee={e.startAt} />
                                })
                            }
                        </table>
                    </div>
                    <div className={styles.lastDataListDiv}>
                        <h3>Last Transaction Placed</h3>
                        <div className={styles.gameCompDiv} style={{ backgroundColor: "#231a2b" }}>
                            <span className={styles.gameCompData}>Sl No</span>
                            <span className={styles.gameCompData}>TransactionID</span>
                            <span className={styles.gameCompData}>Type</span>
                            <span className={styles.gameCompData}>Amount</span>
                        </div>
                        <table className={styles.historyTable}>
                            {
                                lastTransaction.map((e, index) => {
                                    return <LastTransactionComponent key={e._id} index={index} id={e._id} user={e.type} amount={e.amount} />
                                })
                            }
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Admin