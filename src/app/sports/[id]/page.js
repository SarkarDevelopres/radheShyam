"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from './sportStyles.module.css'
import { Spinner } from 'react-bootstrap'
import Loading from '../../../../components/Loading'
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { io } from "socket.io-client";

export function OddsMatchComp({ f, meta, bookmaker, market }) {

  const router = useRouter();
  const [showStake, setShowStake] = useState(false);
  const [amount, chooseAmount] = useState(null);
  const [customStake, setCustomStake] = useState(null);
  const [odds, setOdds] = useState('');
  const [team, setTeam] = useState('');
  const [lay, setLay] = useState(false);

  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    let userToken = localStorage.getItem("userToken");
    return userToken || false;
  }

  const placeBet = async (price, name) => {
    const loggedIn = isLoggedIn();
    if (!loggedIn) {
      alert("Log In to place bets!");
      router.push('/login');
      return; // stop here
    }


    const amnt = customStake ? parseInt(customStake) : amount;

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loggedIn}`,
      },
      body: JSON.stringify({
        token: loggedIn,
        matchId: meta.matchId,
        title: meta.sportkey,
        market: market,
        bookmakerKey: bookmaker,
        selection: team,
        stake: amnt,
        odds: odds,
        lay: lay,
      }),
    });

    const payload = await response.json();

    if (!payload.ok) {
      toast.error(`${payload.message}`)
      return;
    }

    if (payload.ok) {
      console.log(response);

      toast.success(`Bet Placed for ${amnt}!`);
      setShowStake(false);
    }


  }
  const cancel = () => {
    setOdds(0);
    setTeam('')
    setShowStake(false)
  }

  return (
    <div className={styles.bookOddDiv}>
      <div className={styles.teamDiv}>
        <p>{f.name}</p>
        {amount && odds ? <span>{(amount * odds).toFixed(2)}</span> : <></>}
        <div className={styles.betButtons}>
          <button onClick={() => {
            setShowStake(true)
            setOdds(f.price)
            setTeam(f.name)
          }}>{f.price}</button>
          <button onClick={() => {
            setShowStake(true)
            setOdds((f.price / (f.price - 1).toFixed(2)))
            setTeam(f.name)
            setLay(true)
          }}>{(f.price / (f.price - 1)).toFixed(2)}</button>
        </div>
      </div>
      {showStake && <div className={styles.stakeBtnDiv} >
        <div className={styles.inputDiv}>
          <input type="number" value={amount} onChange={(e) => chooseAmount(e.target.value)} />
        </div>
        <div className={styles.stakeChoice} style={{ flexWrap: "wrap" }}>
          {[100, 300, 500, 1000, 3000, 5000, 10000, 50000, 100000].map((amt) => (
            <button
              key={amt}
              onClick={() => chooseAmount(amt)}
              className={amount === amt ? styles.selectedStake : ""}
            >
              {amt}
            </button>
          ))}
        </div>
        <div className={styles.orderBtn}>
          <button onClick={() => placeBet()}>Place Bet</button>
          <button onClick={() => cancel()}>Cancel</button>
        </div>
      </div>}
    </div>
  )
}

function GameComp() {
  const tvRef = useRef(null);
  const spinRef = useRef(null);
  const btnSpan = useRef(null);
  const btnRef = useRef(null);
  const router = useRouter();

  const [snapshot, setSnapshot] = useState(null);

  const [tvOn, setTvOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [oddsData, setOddsData] = useState([]);
  const [metaData, setMetaData] = useState([]);
  const [liveData, setLiveData] = useState({})
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
      setIsLoading(false);
    }
    else {
      console.log(res);

      router.refresh();
    }
  }
  const takeBackBet = async () => {
    console.log("Called ?");

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
      }),
    });

    const payload = await response.json();
    if (!payload.ok) {
      toast.error(`${payload.message}`)
      return;
    }

    if (payload.ok) {
      console.log(response);
      toast.success(`${payload.message}`);
    }


  }
  useEffect(() => {
    let id = localStorage.getItem("matchId");
    let status = localStorage.getItem("status");

    // if (status == "live") {
    //   if (!id) return;

    //   const base = process.env.NEXT_PUBLIC_SERVER_PORT;
    //   const socket = io(base, { transports: ["websocket"] });

    //   socket.on("connect", () => console.log("[socket] connected", socket.id));
    //   socket.onAny((ev, ...args) => {
    //     const payload = args[0]; // usually the data object
    //     console.log("[socket:any]", ev, payload);

    //     if (payload?.response?.live) {
    //       setLiveData(payload.response.live);
    //     }

    //     if (payload?.response?.live_odds?.matchodds) {
    //       setOddsData((prev) => {
    //         const next = { ...prev };
    //         if (next.outcomes) {
    //           next.outcomes = [...next.outcomes];
    //           next.outcomes[0] = { ...next.outcomes[0], price: payload.response.live_odds.matchodds.teama.back };
    //           next.outcomes[1] = { ...next.outcomes[1], price: payload.response.live_odds.matchodds.teamb.back };
    //         }
    //         return next;
    //       });
    //     }
    //   });
    //   socket.emit("watch:join", id);
    //   socket.on("score:update", (d) => console.log("Live score update:", d));
    //   setIsLoading(false)
    //   return () => {
    //     socket.emit("watch:leave", id);
    //     socket.disconnect();
    //   };
    // }
    // else {

      // Run immediately on mount
      fetchData(id);

      // Set up polling every 5 minutes (300,000 ms)
      const interval = setInterval(() => {
        fetchData(id);
      }, 3 * 60 * 1000);
      setIsLoading(false)
      // Clear interval on unmount
      return () => clearInterval(interval);
    // }
  }, []);

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
      <div className={styles.topScoreDiv}>
        <div className={styles.maskDiv}>
          <span style={{position:"absolute",fontSize:"1.3rem"}}>Match not started yet</span>
          <Spinner style={{ display: "block" }} className={styles.spinnerScore} />
        </div>
        <div className={styles.teamnameDiv}>
          <h2>{oddsData[0]?.outcomes[0]?.name}</h2>
          {/* <span>Batting</span> */}
        </div>
        <div className={styles.ballsOverDiv}>
          <div className={styles.runs}>
            0/0
          </div>
          <div className={styles.balls}>
            <span>0</span>
            <span>0</span>
            <span>0</span>
            <span>0</span>
            <span>0</span>
            <span>0</span>
          </div>
          <div className={styles.over}>
            0.0
          </div>
        </div>
        <div className={styles.teamnameDiv}>
          <h2>{oddsData[0]?.outcomes[1]?.name}</h2>
          {/* <span>Bowling</span> */}
        </div>
      </div>
      <div className={styles.oddsDiv}>
        <div className={styles.header}>
          <h3>Match odds</h3>
          <button onClick={takeBackBet} style={{ color: "white" }}>cashout</button>
        </div>
        <div>
          {
            oddsData.map((e, i) => {
              return (
                <div key={i} className={styles.oddsComp}>
                  {
                    e?.outcomes.map((f, j) => {
                      return (
                        <OddsMatchComp key={j} f={f} bookmaker={e.bookmaker} meta={metaData} market={e.market} />
                      )
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default GameComp