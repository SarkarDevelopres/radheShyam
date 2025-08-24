"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../components/AdminSideBar'
import styles from './admin.module.css'
import { MdPersonOutline, MdInstallMobile } from "react-icons/md";
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

export function LastGameComponent({ id, index, type, players, fee }) {
    const normalDate = new Date(fee).toLocaleDateString();
    const concatedGameName = type.slice(0, 6);
    return (
        <tr className={styles.gameCompDiv} style={{ borderBottom: "1px solid rgb(255,255,255,0.1)" }}>
            <td>{index + 1}</td>
            <td className={styles.gameCompData}>{id}</td>
            <td className={styles.gameCompData}>{concatedGameName}</td>
            <td className={styles.gameCompData}>{players}</td>
            <td className={styles.gameCompData}>{normalDate}</td>
        </tr>
    )
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
    const [installs, setInstalls] = useState(2)
    const [lastGames, setLastGames] = useState([{ tableId: 4502, game: "Ludo 2P", status: 2, startAt: "100" }, { tableId: 4412, game: "Ludo 4P", status: 4, startAt: "100" }, { tableId: 4928, game: "Ludo 4P", status: 4, startAt: "100" }, { tableId: 4319, game: "Ludo 2P", status: 2, startAt: "150" }, { tableId: 4583, game: "Ludo 2P", status: 2, startAt: "150" }])
    const [lastTransaction, setLastTransaction] = useState([{ _id: "#8922GX", type: "Nawed123", amount: "50" }, { _id: "#8463HE", type: "Sarkar123", amount: "200" }, { _id: "#6954KQ", type: "Sarkar123", amount: "50" }, { _id: "#7372LP", type: "Nawed123", amount: "100" }, { _id: "#8427MZ", type: "type123", amount: "150" }])

    const fetchGameLogs = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/latestFiveGameLogs`, {
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
            setLastGames([...data.rounds]);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    };

    const fetchTransLogs = async () => {
        try {
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


    useEffect(() => {
        fetchGameLogs()
        fetchTransLogs()
        fetchTotalGames()
        fetchTotalUsers();
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
                        <MdPersonOutline className={styles.dataIcon} />
                        <div className={styles.dataDetails}>
                            <p>Total Games</p>
                            <h3>{totaltypes}</h3>
                        </div>
                    </div>
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
                            <p>{`Revenue (Today)`}</p>
                            <h3>{revenueToday}</h3>
                        </div>
                    </div>
                    <div className={styles.dataCard}>
                        <MdInstallMobile className={styles.dataIcon} />
                        <div className={styles.dataDetails}>
                            <p>{`No.of Installs`}</p>
                            <h3>{installs}</h3>
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
                            <span className={styles.gameCompData}>TableId</span>
                            <span className={styles.gameCompData}>GameName</span>
                            <span className={styles.gameCompData}>Status</span>
                            <span className={styles.gameCompData}>Date</span>
                        </div>
                        <table className={styles.historyTable}>
                            <tbody>
                                {
                                    lastGames.map((e, index) => {
                                        return <LastGameComponent key={index} index={index} id={e.tableId} type={e.game} players={e.status} fee={e.startAt} />
                                    })
                                }
                            </tbody>
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
                                    return <LastTransactionComponent key={index} index={index} id={e._id} user={e.type} amount={e.amount} />
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