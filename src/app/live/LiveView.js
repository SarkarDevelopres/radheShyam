"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from '../sports/style.module.css'
import OddComponent from '../../../components/OddComponent';
import { BiSolidCricketBall } from "react-icons/bi";
import { IoMdFootball, IoIosTennisball, IoIosBasketball, IoIosBaseball } from "react-icons/io";
function LiveView({ initialData }) {
    console.log(initialData.data);

    const [activeSports, setActiveSports] = useState("cricket");
    const [oddsData, setOddsData] = useState({cricket:[...initialData.data ]})
    const cricket = useRef(null);
    const football = useRef(null);
    const tennis = useRef(null);
    const capsule = useRef(null);
    const router = useRouter();


    // const handleSportsChange = (v) => {
    //     if (v == "Cricket") {
    //         cricket.current.style.color = "#00224E";
    //         football.current.style.color = "#02D4F4";
    //         tennis.current.style.color = "#02D4F4";
    //         capsule.current.style.left = "0%";
    //         setActiveSports("cricket");
    //         fetchData("cricket");
    //     }
    //     else if (v == "Football") {
    //         football.current.style.color = "#00224E";
    //         cricket.current.style.color = "#02D4F4";
    //         tennis.current.style.color = "#02D4F4";
    //         capsule.current.style.left = "33.33%";
    //         setActiveSports("soccer");
    //         fetchData("soccer");
    //     }
    //     else {
    //         console.log(v);

    //         tennis.current.style.color = "#00224E";
    //         cricket.current.style.color = "#02D4F4";
    //         football.current.style.color = "#02D4F4";
    //         capsule.current.style.left = "66.99%";
    //         setActiveSports("tennis")
    //         fetchData("tennis");
    //     }
    // }

    const fetchData = async (sports) => {
        console.log("SPORTS: ", sports);

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/live`);

        let res = await req.json();
        if (res.success) {
            setOddsData((p)=>({
                ...p,
                ...res.data
            }));
        }
        else {
            console.log(res);

            router.refresh();
        }


    }

    useEffect(() => {
    }, [])

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
                            oddsData.cricket.map((e) => (
                                <OddComponent key={e.matchId} data={e} />
                            ))
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