"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'

export function GameLogComponent({sl,id,name,players,fee,status,dateTime}) {
    return (
       <tr>
            <td>{sl}</td>
            <td>{id}</td>
            <td>{name}</td>
            <td>{players}</td>
            <td>{fee}</td>
            <td>{status}</td>
            <td>{dateTime}</td>
       </tr>
    )
}

export function GameComponent({name,backImage}){
    return(
        <div className={styles.gameDiv}>
            <div className={styles.gameLogoDiv} style={{backgroundImage:`url(${backImage})`}}></div>
            <p>{name}</p>
        </div>
    )
}

function Games() {
    const [gameLogs, setGameLogs] = useState([
        {
            gameID: '7627FGH',
            name: 'Ludo',
            players: 2,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 17:31:162'
        },
        {
            gameID: '9327UJG',
            name: 'Ludo',
            players: 2,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 17:01:122'
        },
        {
            gameID: '5578RWD',
            name: 'Ludo',
            players: 2,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 16:51:152'
        },
        {
            gameID: '3568UIE',
            name: 'Ludo',
            players: 2,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 16:47:190'
        },
        {
            gameID: '3928SKW',
            name: 'Ludo',
            players: 3,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 15:52:002'
        },
        {
            gameID: '3932SOW',
            name: 'Ludo',
            players: 3,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 15:42:102'
        },
        {
            gameID: '3968UTW',
            name: 'Ludo',
            players: 3,
            fee: 200,
            status: 'completed',
            createdAt: '27-07-2025 15:40:152'
        },
        {
            gameID: '3938YRW',
            name: 'Ludo',
            players: 4,
            fee: 100,
            status: 'completed',
            createdAt: '27-07-2025 14:32:189'
        },
    ])

    const [gameDetails, setGameDetails] = useState([
        {
            name:"Ludo",
            image:'../'
        }
    ])
    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"game"} />
            <div className={styles.adminMainContent}>
                <h2>Games</h2>
                <div className={styles.bigContainer}>
                    <h3>Game Logs</h3>
                    <div className={styles.gameLogContainer}>
                        <table className={styles.gameLogTable}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>GameID</th>
                                    <th>Type</th>
                                    <th>Players</th> 
                                    <th>Entry Fee</th> 
                                    <th>Status</th>
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
                    <h3>Game List</h3>
                </div>
            </div>
        </div>
    )
}

export default Games