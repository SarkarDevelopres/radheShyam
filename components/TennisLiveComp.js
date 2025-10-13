"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from '@/(main)/sports/[id]/sportStyles.module.css'
import { Spinner } from 'react-bootstrap'
import Loading from '@components/Loading'
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { io } from "socket.io-client";
import { useMemo } from "react";
import { cashoutForTeam } from "../lib/cashout";
import { OddsMatchComp } from './MatchOddsComp'
import { SessionOddsMatchComp } from './SessionOddsComp'



function TennisLiveComp() {

    const importantStats = [
        "Aces",
        "Double Faults",
        "1st Serve Percentage",
        "1st Serve Points Won",
        "2nd Serve Points Won",
        "Total Points Won"
    ];

    const tvRef = useRef(null);
    const spinRef = useRef(null);
    const btnSpan = useRef(null);
    const btnRef = useRef(null);
    const router = useRouter();



    const [isLoading, setIsLoading] = useState(true);
    const [oddsData, setOddsData] = useState([]);
    const [sessionOdds, setSessionOdds] = useState([]);
    const [metaData, setMetaData] = useState([]);
    const [matchData, setMatchData] = useState({});
    const [sets, setSets] = useState([]);
    const [gameEnd, setGameEnd] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [matchStats, setMatchStats] = useState({ home: [], away: [] });
    const [server, setServer] = useState("home");
    const [teamData, setTeamData] = useState({
        teama: '',
        teamb: '',
    })
    const [liveData, setLiveData] = useState({ status: "Match Not Started", score: "" })
    const [openBets, setOpenBets] = useState([]);
    const [matchEndProfitLoss, setMatchEndProfitLoss] = useState(0);
    const [gameState, setGameState] = useState({ code: 3, string: "Play Ongoing" })
    const [isStall, setIsStall] = useState(true);
    const [isLive, setIsLive] = useState(false);

    const openTV = () => {
        if (!tvOn) {
            tvRef.current.style.height = "200px";
            spinRef.current.style.display = metaData.streamLink.link ? "none" : "block";
            btnRef.current.style.backgroundColor = "block";
            btnSpan.current.style.marginLeft = "25px";
            setTvOn(true)
        } else {
            setTvOn(false)
            tvRef.current.style.height = "0px";
            spinRef.current.style.display = "none";
            btnSpan.current.style.marginLeft = "0px";
        }
    }
    const fetchData = async (id) => {
        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/matchOdds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // or other content type if needed
            },
            body: JSON.stringify({
                "matchId": id
            })
        });

        let res = await req.json();
        console.log(res);

        if (res.success) {
            setOddsData([res.data]);
            setMetaData({ ...res.meta });
            setSessionOdds([...res.data.sessionOdds]);
            setMatchData({ ...res.matchData })
            setTeamData({
                teama: {
                    name: res.matchData.teamHome.name,
                    image: res.matchData.teamHome.logo_url
                },
                teamb: {
                    name: res.matchData.teamAway.name,
                    image: res.matchData.teamAway.logo_url
                }
            })
            setIsLoading(false);

            if (res.matchData.game_state?.code != 3) {
                setGameState({ ...res.matchData.game_state })
            }
            console.log(gameState);

        }
        else {
            console.log(res);

            router.refresh();
        }
    }
    const fetchLiveOdds = async (base, id) => {
        let req = await fetch(`${base}/api/odds/tennisLive?matchId=${id}`);
        let res = await req.json();
        const toWinOdds = (res.data || []).filter(o => o.odd_name === "To Win");
        const home = toWinOdds.find(o => o.type === "Home");
        const away = toWinOdds.find(o => o.type === "Away");

        console.log(res);


        setOddsData(prev => {
            if (!prev.length) return prev; // no data yet

            const first = prev[0];
            return [
                {
                    ...first,
                    outcomes: [
                        {
                            ...first.outcomes[0],
                            price: home ? parseFloat(home.value) : first.outcomes[0].price,
                        },
                        {
                            ...first.outcomes[1],
                            price: away ? parseFloat(away.value) : first.outcomes[1].price,
                        },
                    ],
                },
            ];
        });

        const sessionOdds = res.data.filter(it => it.suspended === "No")

        const grouped = {};
        for (const o of sessionOdds) {
            const key = `${o.odd_name}_${o.handicap ?? ''}`;
            if (!grouped[key]) {
                grouped[key] = {
                    question_id: key,
                    title: o.odd_name,
                    back_condition: "",
                    back: "",
                    lay_condition: "",
                    lay: "",
                    status: o.suspended === "No" ? "active" : "suspended",
                    category: o.odd_name.split("(")[0].trim(),
                };
            }

            if (["Yes", "Home", "Odd", "1"].includes(o.type)) {
                grouped[key].back_condition = o.type;
                grouped[key].back = o.value;
            } else {
                grouped[key].lay_condition = o.type;
                grouped[key].lay = o.value;
            }
        }

        const sessionOddsTennis = Object.values(grouped);
        setSessionOdds([...sessionOddsTennis])

        console.log(sessionOddsTennis);


    }
    const fetchBets = async (userToken, matchId) => {

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/findMany`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                userToken: userToken,
                matchId: matchId,
            }),
        });

        const payload = await response.json();
        console.log(payload);
        if (payload.ok) {
            setOpenBets([...payload.data])
            if (payload.profitLoss.length > 0) {
                setMatchEndProfitLoss([payload.profitLoss[0].profitHeld])
            }
            else {
                setMatchEndProfitLoss(0)
            }
        }

    }

    const takeBackBet = async () => {
        const confirmed = confirm("Are you sure you want to Cashout ?");

        if (confirmed) {

            let oddsBook = {};

            for (const outcome of oddsData[0].outcomes) {
                oddsBook[outcome.name] = {
                    back: parseFloat(outcome.price),
                    lay: parseFloat((parseFloat(outcome.price) / 0.99).toFixed(2))
                };
            }


            if (typeof window === "undefined") return false;
            let userToken = localStorage.getItem("userToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/take`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    token: userToken,
                    matchId: metaData.matchId,
                    oddsBook: oddsBook
                }),
            });

            const payload = await response.json();
            if (!payload.ok) {
                toast.error(`${payload.message}`)
                return;
            }

            if (payload.ok) {
                console.log(response);
                let matchId = localStorage.getItem("matchId");
                let userToken = localStorage.getItem("userToken");
                toast.success(`${payload.message}`);
                fetchBets(userToken, matchId)
            }

        }

    }

    useEffect(() => {
        let id = localStorage.getItem("matchId");
        fetchData(id);
    }, [])


    useEffect(() => {
        let id = localStorage.getItem("matchId");
        let status = localStorage.getItem("status");

        console.log(status);


        if (status == "live") {

            setIsLive(true)
            if (!id) return;

            const base = process.env.NEXT_PUBLIC_SERVER_PORT;
            const socket = io(base, { transports: ["websocket"] });
            console.log("Came till here");


            socket.on("connect", () => console.log("[socket] connected", socket.id));
            socket.onAny((...args) => {
                const payload = [...args];
                // usually the data object
                // console.log("[socket:any]", payload);

            });
            socket.emit("watch:join", id);
            // socket.on("watch:joined", (d) => {
            //     console.log(d.data);
            // })
            socket.on("score:update", (d) => {
                fetchLiveOdds(base, id);
                setIsStall(false)
                console.log(d);
                if (d.serve == "First Player") {
                    setServer("home")
                }
                else if (d.serve == "Second Player") {
                    setServer("away")
                }
                setLiveData(prev => ({ ...prev, score: d.score, status: d.status }));
                if (d.status == "Finished") {
                    setGameEnd(true);
                    setCompleted(true);
                }

                const homeId = d.teamaId;
                const awayId = d.teambId;

                const homeStats = d.stats.filter(s => s.player_key === homeId && s.stat_period === "match");
                const awayStats = d.stats.filter(s => s.player_key === awayId && s.stat_period === "match");

                const filteredHomeStats = homeStats.filter(s => importantStats.includes(s.stat_name));
                const filteredAwayStats = awayStats.filter(s => importantStats.includes(s.stat_name));

                const matchStats = {
                    home: filteredHomeStats,
                    away: filteredAwayStats
                };

                console.log(matchStats);
                setMatchStats({ ...matchStats });
                setSets([...d.sets])

            })
            return () => {
                socket.emit("watch:leave", id);
                socket.disconnect();
            }
        }

    }, [])

    return (
        <div className={styles.mainDiv}>
            {isLoading && <Loading />}
            <div className={styles.liveTVDiv}>
                <div className={styles.tvHead}>
                    <h3>Live TV</h3>
                    <button ref={btnRef} onClick={openTV}>
                        <span ref={btnSpan} className={styles.buttonSpan}></span>
                    </button>
                </div>
                <div className={styles.tvWrapper}>
                    <iframe
                        ref={tvRef}
                        className={styles.tvDiv}
                        src={metaData?.streamLink?.link}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                    </iframe>
                    <Spinner ref={spinRef} className={styles.spinnerComp} />

                </div>
            </div>
            <div>
            </div>
            <div className={`${styles.topScoreDiv} ${styles.tennisScoreDiv}`}>
                {!isLive && <div className={styles.maskDiv}>
                    <span style={{ position: "absolute", fontSize: "1.3rem" }}>{isStall ? "Watitng For Match Scores " : "Match not started yet"}</span>
                    <Spinner style={{ display: "block" }} className={styles.spinnerScore} />
                </div>}
                {isLive && isStall ?
                    <div className={styles.maskDiv}>
                        <span style={{ position: "absolute", fontSize: "1.3rem" }}>Watitng For Match Scores</span>
                        <Spinner style={{ display: "block" }} className={styles.spinnerScore} />
                    </div>
                    :
                    <></>
                }
                <div className={styles.runRateDiv}>
                    <span>{`${liveData?.status}`}</span>
                </div>

                <div className={styles.scoreDiv}>
                    <h1>{`${liveData?.score}`}</h1>
                </div>
                {/* <div className={styles.ballEvent}>
                    {ballEvent === "Ball Chalu" ? (
                        <img
                            style={{ position: "absolute", left: "10px", top: "0px", width: "100px" }}
                            src="/loading-img.gif"
                            alt="Ball animation"
                        />
                    ) : ballEvent === "Wicket" || ballEvent === "Bowled" || ballEvent === "wicket" || ballEvent === "bowled" ? (
                        <img
                            style={{ position: "absolute", left: "-20px", top: "-50px", width: "150px" }}
                            src="/wicket.gif"
                            alt="Wicket animation"
                        />
                    ) : (
                        <span>{ballEvent}</span>

                    )}
                </div> */}
                {/* <div className={styles.batsmanList}>
                    {
                        batsmenList.map((e, i) => {
                            return <span key={i}>
                                {`${e?.name}(${e.runs})${i == 0 ? '*' : ''}`}
                            </span>
                        })
                    }
                </div>
                <div className={styles.bowlersList}>
                    {
                        bowlersList.length > 0 ? (
                            <>
                                <span>{
                                    `${bowlersList[0]?.name}`}
                                </span>
                                <span>
                                    {
                                        `(over:${bowlersList[0]?.overs}/run:${bowlersList[0]?.runs_conceded
                                        }/wicket:${bowlersList[0]?.wickets
                                        })`
                                    }
                                </span>
                            </>)
                            : (<></>)
                    }
                </div> */}
                {/* <div className={styles.ballsOverDiv}>
                    <div className={styles.runs}>
                        {`${liveData.runs}/${liveData.wickets}`}
                    </div>
                    <div className={styles.balls}>
                        {
                            ballArray.map((e, i) => {
                                return <span key={i}>{e}</span>
                            })
                        }
                    </div>
                    <div className={styles.over}>
                        {liveData.overs}
                    </div>
                </div> */}
                {/* <div className={styles.teamnameDiv}>
                    <h2>{teamData.teamb.name}</h2>
                    {server == "away" ? <span>Serving</span> : <></>}
                </div> */}
                <div className={styles.tennisScoreBoard}>
                    <div className={styles.playerDiv}>
                        <div className={styles.playerDataDiv}>
                            <p>{teamData.teama.name}</p>
                            {server == "home" ? <span className={styles.servingSpan}>Serving</span> : <></>}
                        </div>
                        <div className={styles.setData}>
                            {
                                sets.map((e, i) => {
                                    const currentSet = parseInt(liveData?.status?.replace(/\D/g, ""));
                                    const setNum = parseInt(e.score_set);
                                    if (setNum > currentSet) return null;
                                    return <span key={i}>{parseInt(e?.score_first)}</span>
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.playerDiv}>
                        <div className={styles.playerDataDiv}>
                            <p>{teamData.teamb.name}</p>
                            {server == "away" ? <span className={styles.servingSpan}>Serving</span> : <></>}
                        </div>
                        <div className={styles.setData}>
                            {
                                sets.map((e, i) => {
                                    const currentSet = parseInt(liveData?.status?.replace(/\D/g, ""));
                                    const setNum = parseInt(e.score_set);
                                    if (setNum > currentSet) return null;
                                    return <span key={i}>{parseInt(e?.score_second)}</span>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.statsDiv}>
                <div className={styles.statsHead}>
                    <h3>{teamData.teama.name}</h3>
                    <h3>{teamData.teamb.name}</h3>
                </div>
                <div className={styles.statsData}>
                    <div className={styles.playerStats}>
                        {matchStats?.home.map((e, i) => {
                            return <span key={i}>{e.stat_value}</span>
                        })}
                    </div>
                    <div className={styles.statsName}>
                        {matchStats?.home.map((e, i) => {
                            return <span key={i}>{e.stat_name}</span>
                        })}
                    </div>
                    <div className={styles.playerStats}>
                        {matchStats?.away.map((e, i) => {
                            return <span key={i}>{e.stat_value}</span>
                        })}
                    </div>
                </div>
            </div>
            <div className={styles.oddsDiv}>
                <div className={styles.header}>
                    <h3>Match Odds</h3>
                    {!completed && <button onClick={takeBackBet} style={{ color: "white" }}>cashout</button>}
                </div>
                <div className={styles.backLayNameBar}>
                    <div>
                        <span onClick={() => {
                            console.log(gameState);
                        }}>Back</span>
                        <span>Lay</span>
                    </div>
                </div>
                <div className={styles.sessionoddsDiv}>
                    {gameEnd && (
                        <div className={styles.maskDivSession}>
                            <Spinner />
                            <span>
                                {(gameState.code === 0 || gameState.code === 3)
                                    ? "Suspended"
                                    : (gameState.string || "Suspended")}
                            </span>
                        </div>
                    )}



                    {completed && <div className={styles.maskDivSession}>
                        <Spinner />
                        <span>Match Completed, rewards within 30 mins</span>
                    </div>}
                    {
                        oddsData.map((e, i) => {
                            return (
                                <div key={i} className={styles.oddsComp}>
                                    {
                                        e?.outcomes.map((f, j) => {
                                            return (
                                                <OddsMatchComp key={j} f={f} bookmaker={e.bookmaker} meta={metaData} matchData={matchData} market={e.market} fetchBet={fetchBets} openBets={openBets} profitLoss={Number(matchEndProfitLoss)} />
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className={styles.oddsDiv}>
                <div className={styles.header}>
                    <h3>Open Bets</h3>
                </div>
                <div className={styles.oddsComp}>
                    <div className={styles.betComps}>
                        {openBets.map((e, i) => {
                            return <div key={i} className={styles.betIndiComps} >
                                <p className={styles.betTeamName}>{(e?.selectionName).slice(0, 11)}</p>
                                <p className={styles.betOdd}>{e?.lay ? 'lay' : 'back'}</p>
                                <p className={styles.betOdd}>{e.odds}</p>
                                <p className={styles.betStake}>{e.stake}</p>
                            </div>
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.sessionoddsDiv}>
                <div className={styles.maskDivSession}>
                    <Spinner />
                    <span>Session Odds are being added....</span>
                </div>
                {
                    sessionOdds.map((e, i) => {
                        return (
                            <div key={i} className={styles.oddsComp}>
                                {
                                    <SessionOddsMatchComp f={e} />
                                }
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}


export default TennisLiveComp