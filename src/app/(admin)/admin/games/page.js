"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'

export function GameLogComponent({ sl, id, name, players, fee, status, dateTime }) {
    return (
        <tr>
            <td>{sl+200}</td>
            <td>{id}</td>
            <td>{name}</td>
            <td>{players}</td>
            <td>{fee}</td>
            <td>{status}</td>
            <td>{dateTime}</td>
        </tr>
    )
}
export function SportsLogComponent({ sl, id, name, players, fee, status, dateTime }) {
    return (
        <tr>
            <td>{sl+200}</td>
            <td>{name}</td>
            <td>{id}</td>
            <td>{players}</td>
            <td>{fee}</td>
            <td>{status}</td>
            <td>{dateTime}</td>
        </tr>
    )
}

export function GameComponent({ name, backImage }) {
    return (
        <div className={styles.gameDiv}>
            <div className={styles.gameLogoDiv} style={{ backgroundImage: `url(${backImage})` }}></div>
            <p>{name}</p>
        </div>
    )
}

function Games() {
    const [gameLogs, setGameLogs] = useState([
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "TIGER",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "DRAGON",
            players: 100,
            status: 'WON',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "TIGER",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "DRAGON",
            players: 100,
            status: 'WON',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "TIGER",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "DRAGON",
            players: 100,
            status: 'WON',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "TIGER",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "DRAGON",
            players: 100,
            status: 'WON',
            createdAt: '14-10-2025 8:40 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'abdulk@772',
            fee: "DRAGON",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:38 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'kiran@123',
            fee: 'DRAGON',
            players: 200,
            status: 'LOST',
            createdAt: '14-10-2025 8:33 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'kiran@123',
            fee: 'DRAGON',
            players: 200,
            status: 'LOST',
            createdAt: '14-10-2025 8:33 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'raunak@342',
            fee: "TIGER",
            players: 200,
            status: 'WON',
            createdAt: '14-10-2025 8:32 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'bubu@123',
            fee: 'SEVEN',
            players: 200,
            status: 'WON',
            createdAt: '14-10-2025 8:32 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'kiran@123',
            fee: 'DRAGON',
            players: 200,
            status: 'LOST',
            createdAt: '14-10-2025 8:32 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'kiran@123',
            fee: 'DRAGON',
            players: 200,
            status: 'LOST',
            createdAt: '14-10-2025 8:32 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@342',
            fee: "UP",
            players: 400,
            status: 'LOST',
            createdAt:'14-10-2025 8:25 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@342',
            fee: "BLACK",
            players: 200,
            status: 'WON',
            createdAt:'14-10-2025 8:22 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@342',
            fee: "UP",
            players: 200,
            status: 'WON',
            createdAt:'14-10-2025 8:21 PM'
        },
        {
            gameID: 'Dragon-Tiger',
            name: 'kiran@123',
            fee: "DRAGON",
            players: 2000,
            status: 'LOST',
            createdAt: '14-10-2025 8:21 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
        {
            gameID: '7-Up-Down',
            name: 'raunak@123',
            fee: "DOWN",
            players: 100,
            status: 'LOST',
            createdAt: '14-10-2025 8:20 PM'
        },
    ])

    const [gameDetails, setGameDetails] = useState([
        {
            name: "Ludo",
            image: '../'
        }
    ])
    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"game"} />
            <div className={styles.adminMainContent}>
                <h2>Bets</h2>
                <div className={styles.bigContainer}>
                    <h3>Casino Bets Logs</h3>
                    <div className={styles.gameLogContainer} style={{height:"10000px"}}>
                        <table className={styles.gameLogTable} style={{height:"100px"}}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>Game Name</th>
                                    <th>UserName</th>
                                    <th>Amount</th>
                                    <th>Option</th>
                                    <th>Result</th>
                                    <th>Date-Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    gameLogs.map((e, index) => {
                                        return <GameLogComponent key={index} sl={index} id={e.gameID} name={e.name} players={e.players} fee={e.fee} status={e.status} dateTime={e.createdAt} />
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.bigContainer}>
                    <h3>Sports Bets Logs</h3>
                    <div className={styles.gameLogContainer} style={{height:"10000px"}}>
                        <table className={styles.gameLogTable} style={{height:"100px"}}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>UserName</th>
                                    <th>Team Name</th>
                                    <th>Amount</th>
                                    <th>Lay/Back</th>
                                    <th>Odds</th>
                                    <th>Date-Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    gameLogs.map((e, index) => {
                                        return <SportsLogComponent key={index} sl={index} id={e.gameID} name={e.name} players={e.players} fee={e.fee} status={e.status} dateTime={e.createdAt} />
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.bigContainer}>
                    <h3>Game List</h3>
                </div>
            </div>
        </div>
    )
}

export default Games