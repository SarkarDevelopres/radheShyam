"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from '../sports/style.module.css'
import OddComponent from '@components/OddComponent';
import { BiSolidCricketBall } from "react-icons/bi";
import { IoMdFootball, IoIosTennisball, IoIosBasketball, IoIosBaseball } from "react-icons/io";
function LiveView({ initialData }) {
    // console.log(initialData.data);

    const normalized = Object.assign({}, ...initialData.data);
    const [oddsData, setOddsData] = useState(normalized);
    const router = useRouter();

    return (
        <div className={styles.mainDiv}>
            <h2>In-Play</h2>
            <div className={styles.betsList}>
                <div className={styles.sportsField}>
                    <div className={styles.sportsHead}>
                        <h3>Cricket</h3>
                        <BiSolidCricketBall color={"red"} />
                    </div>
                    <div className={styles.oddsGroup}>
                        {(oddsData?.cricket?.length ?? 0) > 0 ? (
                            oddsData.cricket.map((e) => {
                                console.log(e);
                                return <OddComponent key={e.matchId} data={e} sport={"cricket"} />
                            })
                        ) : (
                            <p>No live match</p>
                        )}
                    </div>
                </div>
                <div className={styles.sportsField}>
                    <div className={styles.sportsHead}>
                        <h3>Football</h3>
                        <IoMdFootball color={"white"} />
                    </div>
                    <div className={styles.oddsGroup}>
                        {(oddsData?.football?.length ?? 0) > 0 ? (
                            oddsData.football.map((e) => (
                                <OddComponent key={e.matchId} data={e} />
                            ))
                        ) : (
                            <p>No live match</p>
                        )}
                    </div>
                </div>
                <div className={styles.sportsField}>
                    <div className={styles.sportsHead}>
                        <h3>Tennis</h3>
                        <IoIosTennisball color={"lime"} />
                    </div>
                    <div className={styles.oddsGroup}>
                        {(oddsData?.tennis?.length ?? 0) > 0 ? (
                            oddsData.tennis.map((e) => (
                                <OddComponent key={e.matchId} data={e} />
                            ))
                        ) : (
                            <p>No live match</p>
                        )}
                    </div>
                </div>
                <div className={styles.sportsField}>
                    <div className={styles.sportsHead}>
                        <h3>Basketball</h3>
                        <IoIosBasketball color={"orange"} />
                    </div>
                    <div className={styles.oddsGroup}>
                        {(oddsData?.basketball_nba?.length ?? 0) > 0 ? (
                            oddsData.basketball_nba.map((e) => (
                                <OddComponent key={e.matchId} data={e} />
                            ))
                        ) : (
                            <p>No live match</p>
                        )}
                    </div>

                </div>
                <div className={styles.sportsField}>
                    <div className={styles.sportsHead}>
                        <h3>Baseball</h3>
                        <IoIosBaseball color={"white"} style={{ backgroundColor: "red", borderRadius: "50%" }} />
                    </div>
                    <div className={styles.oddsGroup}>
                        {(oddsData?.baseball?.length ?? 0) > 0 ? (
                            oddsData.baseball.map((e) => (
                                <OddComponent key={e.matchId} data={e} />
                            ))
                        ) : (
                            <p>No live match</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveView