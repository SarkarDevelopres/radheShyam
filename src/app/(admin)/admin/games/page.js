"use client"
import React, { useState, useEffect, useRef } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
import { TbZoomReset } from "react-icons/tb";
import { toast } from 'react-toastify';

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
function parseInputTime(inputStr) {
    if (!inputStr) return null;
    const [datePart, timePart] = inputStr.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split("-").map(Number);
    return new Date(year, month - 1, day, hour, minute);
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

    const [casinoLogs, setCasinoLogs] = useState([]);
    const [sportsLogs, setSportsLogs] = useState([]);
    const [isMaintiance, setIsMaintiance] = useState(false);

    const [searchData, setSearchData] = useState({
        username: "",
        won: "",
        game_name: "",
        fromTime: "",
        toTime: "",
    });
    const [searchSportsData, setSearchSportsData] = useState({
        username: "",
        lay: "",
        team_name: "",
        fromTime: "",
        toTime: "",
    });

    const btnSpan = useRef(null);
    const btnRef = useRef(null);
    const btnSpanSport = useRef(null);
    const btnRefSport = useRef(null);

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
    const toggelMaintance = () => {
        const btnWidth = btnRef.current.offsetWidth; // total button width in px
        const moveDistance = btnWidth - 40; // full width minus 10px

        if (!isMaintiance) {
            btnRef.current.style.backgroundColor = "#009320ff";
            btnSpan.current.style.marginLeft = `${moveDistance}px`;
            setSearchData((p) => ({ ...p, won: true }));
            setIsMaintiance(true)
        } else {
            setIsMaintiance(false);
            btnRef.current.style.backgroundColor = "#007deb";
            btnSpan.current.style.marginLeft = "0px";
            setSearchData((p) => ({ ...p, won: false }));
        }
    };
    const toggelSportMaintance = () => {
        const btnWidth = btnRefSport.current.offsetWidth; // total button width in px
        const moveDistance = btnWidth - 40; // full width minus 10px

        if (!isMaintiance) {
            btnRefSport.current.style.backgroundColor = "#009320ff";
            btnSpanSport.current.style.marginLeft = `${moveDistance}px`;
            setIsMaintiance(true)
            setSearchSportsData((p) => ({ ...p, lay: true }));
        } else {
            setIsMaintiance(false);
            btnRefSport.current.style.backgroundColor = "#007deb";
            btnSpanSport.current.style.marginLeft = "0px";
            setSearchSportsData((p) => ({ ...p, lay: false }));
        }
    };
    const fetchSingleUser = () => {
        const { username, won, game_name, fromTime, toTime } = searchData;

        const fromDate = parseInputTime(fromTime);
        const toDate = parseInputTime(toTime);

        let sortedData = casinoLogs
            .filter(item => {
                // username filter (case-insensitive)
                if (username && !item.username.toLowerCase().includes(username.toLowerCase())) return false;

                // game name filter
                if (game_name && item.game !== game_name) return false;

                // win/loss filter
                if (won !== "" && won !== null) {
                    // if you treat true = 'WON', false = 'LOST'
                    const shouldBe = won ? "WON" : "LOST";
                    if (item.status.toUpperCase() !== shouldBe) return false;
                }

                // time range filter
                const createdAt = new Date(item.createdAt);
                if (fromDate && createdAt < fromDate) return false;
                if (toDate && createdAt > toDate) return false;

                return true;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

        if (sortedData.length) {
            toast.success("user found");
            setCasinoLogs(sortedData)
        }
        else {
            toast.error("user not found");
        }
    }
    const fetchSingleSportUser = () => {
        const { username, lay, team_name, fromTime, toTime } = searchSportsData;
        const fromDate = parseInputTime(fromTime);
        const toDate = parseInputTime(toTime);

        let sortedData = sportsLogs
            .filter(item => {
                // username filter (case-insensitive)
                if (username && !item.username.toLowerCase().includes(username.toLowerCase())) return false;

                // game name filter
                if (team_name && item.selectionName !== team_name) return false;

                // win/loss filter
                if (lay !== "" && lay !== null) {
                    if (item.lay !== lay) return false;
                }

                // time range filter
                const createdAt = new Date(item.createdAt);
                if (fromDate && createdAt < fromDate) return false;
                if (toDate && createdAt > toDate) return false;

                return true;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

        if (sortedData.length) {
            toast.success("user found");
            setSportsLogs(sortedData)
        }
        else {
            toast.error("user not found");
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
                <div className={styles.bigContainer} style={{ width: "100%" }}>
                    <h3>Casino Bets Logs</h3>
                    <div className={styles.employeeSeacrhBar} >
                        <input placeholder='User Name' style={{ width: 200, color:'#fff' }} value={searchData.username} onChange={(e) => setSearchData((p) => ({ ...p, username: e.target.value }))} />

                        <input placeholder='Team Name' style={{ width: 200, color:'#fff' }} value={searchData.game_name} onChange={(e) => setSearchData((p) => ({ ...p, game_name: e.target.value }))} />
                        <span style={{ paddingRight: 5, paddingLeft: 5, color: "rgba(174, 174, 174, 1)" }}>Lost</span>
                        <button
                            style={{
                                width: "60px",
                                borderRadius: "20px",
                                padding: "5px 10px",
                                justifyContent: "flex-start",
                                border: "none",
                                outline: "none",
                                backgroundColor: "rgba(174, 174, 174, 1)",
                                position: "relative",
                                cursor: "pointer",
                                transition: "background-color 0.3s",
                            }}
                            className={styles.maintainceDivBtn}
                            onClick={toggelMaintance}
                            ref={btnRef}
                        >
                            <span
                                className={styles.buttonSpan}
                                ref={btnSpan}
                            ></span>
                        </button>
                        <span style={{ paddingLeft: 5, paddingRight: 5, color: "rgba(174, 174, 174, 1)" }}>Won</span>
                        <input placeholder='DD-MM-YYYY HH-MM' style={{ width: "150px", color:'#fff' }} value={searchData.fromTime} onChange={(e) => setSearchData((p) => ({ ...p, fromTime: e.target.value }))} />

                        <input placeholder='DD-MM-YYYY HH-MM' style={{ width: "150px", color:'#fff' }} value={searchData.toTime} onChange={(e) => setSearchData((p) => ({ ...p, toTime: e.target.value }))} />
                        <button style={{ padding: "10px 0px", width:"50px" }} onClick={fetchSingleUser}><MdSearch /></button>
                        <button style={{ padding: "10px 0px", width:"50px" }} onClick={fetchLogsData}><TbZoomReset /></button>
                    </div>
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
                <div className={styles.bigContainer} style={{ width: "100%" }}>
                    <h3>Sports Bets Logs</h3>
                    <div className={styles.employeeSeacrhBar}>
                        <input placeholder='User Name' style={{ width: 200, color:'#fff' }} value={searchSportsData.username} onChange={(e) => setSearchSportsData((p) => ({ ...p, username: e.target.value }))} />

                        <input placeholder='Team Name' style={{ width: 200, color:'#fff' }} value={searchSportsData.game_name} onChange={(e) => setSearchSportsData((p) => ({ ...p, game_name: e.target.value }))} />
                        <span style={{ paddingRight: 5, paddingLeft: 5, color: "rgba(174, 174, 174, 1)" }}>Back</span>
                        <button
                            style={{
                                width: "60px",
                                borderRadius: "20px",
                                padding: "5px 10px",
                                justifyContent: "flex-start",
                                border: "none",
                                outline: "none",
                                backgroundColor: "rgba(174, 174, 174, 1)",
                                position: "relative",
                                cursor: "pointer",
                                transition: "background-color 0.3s",
                            }}
                            className={styles.maintainceDivBtn}
                            onClick={toggelSportMaintance}
                            ref={btnRefSport}
                        >
                            <span
                                className={styles.buttonSpan}
                                ref={btnSpanSport}
                            ></span>
                        </button>
                        <span style={{ paddingLeft: 5, paddingRight: 5, color: "rgba(174, 174, 174, 1)" }}>Lay</span>
                        <input placeholder='DD-MM-YYYY HH-MM' style={{ width: "150px", color:'#fff' }} value={searchSportsData.fromTime} onChange={(e) => setSearchSportsData((p) => ({ ...p, fromTime: e.target.value }))} />

                        <input placeholder='DD-MM-YYYY HH-MM' style={{ width: "150px", color:'#fff' }} value={searchSportsData.toTime} onChange={(e) => setSearchSportsData((p) => ({ ...p, toTime: e.target.value }))} />
                        <button style={{ padding: "10px 0px", width:"50px" }} onClick={fetchSingleSportUser}><MdSearch /></button>
                        <button style={{ padding: "10px 0px", width:"50px" }} onClick={fetchLogsData}><TbZoomReset /></button>
                    </div>
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
        </div >
    )
}

export default Games