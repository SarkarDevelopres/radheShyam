"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'

export function MatchListComponent({ sl, team_a, team_b, winner, sport, status, dateTime }) {
    return (
        <tr>
            <td>{sl + 1}</td>
            <td>{sport}</td>
            <td>{team_a}</td>
            <td>{team_b}</td>
            <td>{winner}</td>
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

function Matches() {
    const [cricketList, setCricketList] = useState([])
    const [tennisList, setTennisList] = useState([])

    const fetchLogsData = async () => {
        try {
            let matchListReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/matchList`);
            let matchListRes = await matchListReq.json();

            if (matchListRes.ok) {
                const cricketMatches = matchListRes.data.filter(m => m.sport?.toLowerCase() === "cricket");
                const tennisMatches = matchListRes.data.filter(m => m.sport?.toLowerCase() === "tennis");
                setCricketList([...cricketMatches])
                setTennisList([...tennisMatches])
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
            <AdminSideBar page={"match"} />
            <div className={styles.adminMainContent}>
                <h2>Matches</h2>
                <div className={styles.bigContainer}>
                    <h3>Cricket Matches</h3>
                    <div className={styles.gameLogContainer} style={{ height: "10000px" }}>
                        <table className={styles.gameLogTable} style={{ height: "100px" }}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>Sport</th>
                                    <th>Team A</th>
                                    <th>Team B</th>
                                    <th>Winner</th>
                                    <th>Status</th>
                                    <th>Date-Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    cricketList.map((e, index) => {
                                        return <MatchListComponent key={index} sl={index} sport={e.sport} team_a={e.teamHome} team_b={e.teamAway} winner={e.winner} status={e.status} dateTime={e.createdAt} />
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.bigContainer}>
                    <h3>Tennis Matches</h3>
                    <div className={styles.gameLogContainer} style={{ height: "10000px" }}>
                        <table className={styles.gameLogTable} style={{ height: "100px" }}>
                            <thead>
                                <tr>
                                    <th>Sl</th>
                                    <th>Sport</th>
                                    <th>Team A</th>
                                    <th>Team B</th>
                                    <th>Winner</th>
                                    <th>Status</th>
                                    <th>Date-Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tennisList.map((e, index) => {
                                        return <MatchListComponent key={index} sl={index} sport={e.sport} team_a={e.teamHome} team_b={e.teamAway} winner={e.winner} status={e.status} dateTime={e.createdAt} />
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

export default Matches