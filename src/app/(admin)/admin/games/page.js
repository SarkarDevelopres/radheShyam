"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'

function formatReadableTime(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'short',   // "Jan", "Feb", ...
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,    // 24-hour format; set to true for AM/PM
    };
    return date.toLocaleString('en-GB', options).replace(',', '');
}

export function GameLogComponent({ sl, game_name, user_name, stake, market, status, dateTime }) {
    return (
        <tr>
            <td>{sl + 1}</td>
            <td>{game_name}</td>
            <td>{user_name}</td>
            <td>{stake}</td>
            <td>{market}</td>
            <td>{status}</td>
            <td>{formatReadableTime(dateTime)}</td>
        </tr>
    )
}
export function SportsLogComponent({ sl, team_name, user_name, stake, odds, lay, status, dateTime }) {
    return (
        <tr>
            <td>{sl + 1}</td>
            <td>{team_name}</td>
            <td>{user_name}</td>
            <td>{stake}</td>
            <td>{lay ? "Lay" : "Back"}</td>
            <td>{odds}</td>
            <td>{status}</td>
            <td>{formatReadableTime(dateTime)}</td>
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

    const [casinoLogs, setCasinoLogs] = useState([])
    const [sportsLogs, setSportsLogs] = useState([])

    const fetchLogsData = async () => {
        try {
            let casinoBetReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/casinoBetsLogs`);
            let sportsBetReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/sportBetsLogs`);

            let casinoBetRes = await casinoBetReq.json();
            let sportsBetRes = await sportsBetReq.json();

            if (casinoBetRes.ok && sportsBetRes.ok) {
                setCasinoLogs([...casinoBetRes.data])
                setSportsLogs([...sportsBetRes.data])
            }
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        fetchLogsData();
    }, [])

    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"game"} />
            <div className={styles.adminMainContent}>
                <h2>Bets</h2>
                <div className={styles.bigContainer}>
                    <h3>Casino Bets Logs</h3>
                    <div className={styles.gameLogContainer} style={{ height: "10000px" }}>
                        <table className={styles.gameLogTable} style={{ height: "100px" }}>
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
                                    casinoLogs.map((e, index) => {
                                        return <GameLogComponent key={index} sl={index} game_name={e.game} user_name={e.username} stake={e.stake} market={e.market} status={e.status} dateTime={e.createdAt} />
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.bigContainer}>
                    <h3>Sports Bets Logs</h3>
                    <div className={styles.gameLogContainer} style={{ height: "10000px" }}>
                        <table className={styles.gameLogTable} style={{ height: "100px" }}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>Team Name</th>
                                    <th>UserName</th>
                                    <th>Amount</th>
                                    <th>Lay/Back</th>
                                    <th>Odds</th>
                                    <th>Status</th>
                                    <th>Date-Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    sportsLogs.map((e, index) => {
                                        return <SportsLogComponent key={index} sl={index} team_name={e.selectionName} user_name={e.username} stake={e.stake} odds={e.odds} lay={e.lay} status={e.status} dateTime={e.createdAt} />
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Games