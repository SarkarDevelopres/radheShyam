"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from './sportStyles.module.css'
import { Spinner } from 'react-bootstrap'
import Loading from '../../../../components/Loading'
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { io } from "socket.io-client";
import { useMemo } from "react";
import { cashoutForTeam } from "../../../../lib/cashout";

export function OddsMatchComp({ f, meta = "", bookmaker = "", market = "", fetchBet, openBets }) {

  const router = useRouter();
  const [showStake, setShowStake] = useState(false);
  const [amount, chooseAmount] = useState(null);
  const [customStake, setCustomStake] = useState("");
  const [odds, setOdds] = useState('');
  const [team, setTeam] = useState('');
  const [lay, setLay] = useState(false);

  const payout = useMemo(() => {
    // oddsBook must be keyed by team name
    const oddsBook = {
      [f.name]: {
        back: f.price,
        lay: (f.price / 0.99).toFixed(2)
      }
    };

    // This handles multiple bets internally
    return cashoutForTeam(openBets, f.name, oddsBook);
  }, [openBets, f]);

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


    let amnt = customStake ? parseInt(customStake) : amount;
    let deductAmnt = amnt;
    if (lay == true) {
      let layOdds = (parseFloat(odds) - 1).toFixed(2)
      deductAmnt = layOdds * parseInt(amount)
    }

    console.log(amnt);

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
        deductAmount: deductAmnt,
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
      fetchBet(loggedIn, meta.matchId)
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
        {
          <span style={{ color: payout.profitNow < 0 ? "red" : "green" }}>{payout.profitNow}</span>
        }
        <div className={styles.betButtons}>
          <button onClick={() => {
            setLay(false)
            setShowStake(true)
            setOdds(parseFloat(f.price).toFixed(2))
            setTeam(f.name)
          }}>{f.price ? f.price : 1}</button>
          <button onClick={() => {
            setShowStake(true)
            setOdds((((f.price ? f.price : 1) / 0.99).toFixed(2)))
            setTeam(f.name)
            setLay(true)
          }}>{(f.price / (0.99)).toFixed(2)}</button>
        </div>
      </div>
      {showStake && <div className={styles.stakeBtnDiv} >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className={styles.inputDiv}>
            <input type="number" value={amount} onChange={(e) => {
              chooseAmount(e.target.value)
              setCustomStake(e.target.value)
              }} />
          </div>
          {amount && odds ? <span>{
            !lay ? (amount * odds).toFixed(2)
              :
              (parseFloat(amount) + ((parseFloat(odds) - 1).toFixed(2) * parseInt(amount)))}
          </span> : <span></span>
          }
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
export function SessionOddsMatchComp({ f }) {

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

    // const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/place`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${loggedIn}`,
    //   },
    //   body: JSON.stringify({
    //     token: loggedIn,
    //     matchId: meta.matchId,
    //     title: meta.sportkey,
    //     market: market,
    //     bookmakerKey: bookmaker,
    //     selection: team,
    //     stake: amnt,
    //     odds: odds,
    //     lay: lay,
    //   }),
    // });

    // const payload = await response.json();

    // if (!payload.ok) {
    //   toast.error(`${payload.message}`)
    //   return;
    // }

    // if (payload.ok) {
    //   console.log(response);

    // }

    toast.success(`Bet Placed for ${amnt}!`);
    setShowStake(false);

  }
  const cancel = () => {
    setOdds(0);
    setTeam('')
    setShowStake(false)
  }

  return (
    <div className={styles.bookOddDiv}>
      <div className={styles.teamDiv}>
        <p>{f.title}</p>
        {amount && odds ? <span>{(amount * odds).toFixed(2)}</span> : <></>}
        <div className={styles.sessionOddBets}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
            <span>
              {`Yes`}
            </span>
            <span>
              {`No`}
            </span>
          </div>
          <div className={styles.betButtons}>
            <button onClick={() => {
              setShowStake(true)
              setOdds(f.back)
              setTeam(f.back_condition)
            }}>
              <span>{`${f.back_condition}`}</span>
              <span>{`${f.back}`}</span>
            </button>
            <button onClick={() => {
              setShowStake(true)
              setOdds(f.lay)
              setTeam(f.lay_condition)
              setLay(true)
            }}>
              <span>{`${f.lay_condition}`}</span>
              <span>{`${f.lay}`}</span>
            </button>
          </div>
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
  const [teamData, setTeamData] = useState({
    teama: '',
    teamb: '',
  })

  const [isStall, setIsStall] = useState(false);

  const [tvOn, setTvOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [oddsData, setOddsData] = useState([]);
  const [metaData, setMetaData] = useState([]);
  const [liveData, setLiveData] = useState({
    runs: 0,
    wickets: 0,
    overs: 0.0,
    runrate: 0.0,
    required_runrate: 0.0,
    target: 0

  })
  const [openBets, setOpenBets] = useState([])
  const [batsmenList, setBatsmenList] = useState([])
  const [bowlersList, setBowlersList] = useState([])
  const [ballEvent, setBallEvent] = useState("");
  const [ballArray, setBallArray] = useState(["", "", "", "", "", ""]);
  const [isLive, setIsLive] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState("")
  const [sessionOdds, setSessionOdds] = useState([])
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
    let teama = localStorage.getItem("home")
    let teamb = localStorage.getItem("away")
    setTeamData({
      teama, teamb
    })
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
      setSessionOdds([...res.data.sessionOdds])
      setIsLoading(false);
    }
    else {
      console.log(res);

      router.refresh();
    }
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
    console.log(payload.data);
    if (payload.ok) {
      setOpenBets([...payload.data])
    }

  }
  const takeBackBet = async () => {
    console.log("Called ?");

    const confirmed = confirm("Are you sure you want to Delete Bet ?");

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
    let status = localStorage.getItem("status");


    if (status == "live") {
      setIsStall(true)
      if (!id) return;

      const base = process.env.NEXT_PUBLIC_SERVER_PORT;
      const socket = io(base, { transports: ["websocket"] });

      socket.on("connect", () => console.log("[socket] connected", socket.id));
      socket.onAny((...args) => {
        const payload = [...args];
        // usually the data object
        // console.log("[socket:any]", payload);

      });
      socket.emit("watch:join", id);
      socket.on("watch:joined", (d) => {
        // console.log(d.data);

        if (d?.data) {
          if (d?.data?.data?.liveScore) {
            setLiveData(d.data.data.liveScore);
          }
          setBatsmenList(d.data.data.batsmenList)
          setBowlersList(d.data.data.bowlersList)
          let batTeam = d.data.data.batBowl.batting;
          let bowlTeam = d.data.data.batBowl.bowling;
          let teamData = { teama: batTeam, teamb: bowlTeam };
          setTeamData(teamData)
          setIsLive(true)
          setOddsData([{
            outcomes: [{
              name: d.data.data.teamData.teama,
              price: d.data.data.liveOdds.matchodds.teama.back
            },
            {
              name: d.data.data.teamData.teamb,
              price: d.data.data.liveOdds.matchodds.teamb.back
            },]
          }]);
          setSessionOdds(d.data.data.sessionOdds)
        }
      })
      socket.on("score:update", (d) => {

        if (d?.data?.liveScore) {
          setLiveData(d.data.liveScore);
        }

        if (d.kind == "snapshot") {
          let batTeam = d.data.batBowl.batting;
          let bowlTeam = d.data.batBowl.bowling;
          let teamData = { teama: batTeam, teamb: bowlTeam };
          setBatsmenList(d.data.batsmenList)
          setBowlersList(d.data.bowlersList)
          setTeamData(teamData)
          setIsLive(true)
          setOddsData([{
            outcomes: [{
              name: d.data.teamData.teama,
              price: d.data.liveOdds.matchodds.teama.back
            },
            {
              name: d.data.teamData.teamb,
              price: d.data.liveOdds.matchodds.teamb.back
            },]
          }]);
          setSessionOdds(d.data.sessionOdds);
          setLiveUpdate(d.data.liveStatus);
          // console.log("Live score update:", d.data.liveStatus)
        }
        if (d.kind === "ball") {
          setBallEvent(d.data.ball_event)
          let ballNo = parseInt(d.data.data.ball, 10);

          if (ballNo <= 6) {
            setBallArray((prev) => {
              const updated = [...prev];
              let val;
              if (d.data.ball_event === "dot") {
                val = "0";        // keep blank for dot ball
                updated[ballNo - 1] = val;
                return updated;
              } else if (d.data.ball_event === "Stumps" || d.data.ball_event === "Caught" || d.data.ball_event === "LBW" || d.data.ball_event === "Bowled" || d.data.ball_event === "Wicket" || d.data.ball_event === "3rd umpire out"
              ) {
                val = "w";
                updated[ballNo - 1] = val;
                return updated;
              } else if (d.data.ball_event === "Wide") {
                val = "wd";
                updated[ballNo - 1] = val;
                return updated;
              } else if (d.data.ball_event === "1") {
                val = "1";
                updated[ballNo - 1] = val;
                return updated;
              }
              else if (d.data.ball_event === "2") {
                val = "2";
                updated[ballNo - 1] = val;
                return updated;
              }
              else if (d.data.ball_event === "3") {
                val = "3";
                updated[ballNo - 1] = val;
                return updated;
              }
              else if (d.data.ball_event === "5") {
                val = "5";
                updated[ballNo - 1] = val;
                return updated;
              }
              else if (d.data.ball_event === "4" || d.data.ball_event === "four") {
                val = "4";
                updated[ballNo - 1] = val;
                return updated;
              }
              else if (d.data.ball_event === "6" || d.data.ball_event === "six") {
                val = "6";
                updated[ballNo - 1] = val;
                return updated;
              }
              return updated
            });
          }
          if (d.data.ball_event === "Over") {
            setTimeout(() => {
              setBallArray(["", "", "", "", "", ""]); // reset for new over
            }, 2000);
          }
        }

      });
      return () => {
        socket.emit("watch:leave", id);
        socket.disconnect();
      };
    }
    else {

      // Run immediately on mount
      fetchData(id);

      // Set up polling every 5 minutes (300,000 ms)
      const interval = setInterval(() => {
        fetchData(id);
      }, 3 * 60 * 1000);
      setIsLoading(false)
      // Clear interval on unmount
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    let id = localStorage.getItem("matchId");
    let userToken = localStorage.getItem("userToken");
    fetchData(id);
    fetchBets(userToken, id)
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
        <p style={{ textAlign: "center", fontSize: "1.3rem", color: "#02d4f4" }}>{liveUpdate}</p>
      </div>
      <div className={styles.topScoreDiv}>
        {!isLive && <div className={styles.maskDiv}>
          <span style={{ position: "absolute", fontSize: "1.3rem" }}>{isStall ? "Watitng For Match Scores " : "Match not started yet"}</span>
          <Spinner style={{ display: "block" }} className={styles.spinnerScore} />
        </div>}
        <div className={styles.teamnameDiv}>
          <h2>{teamData.teama}</h2>
          <span>Batting</span>
        </div>
        <div className={styles.runRateDiv}>
          {liveData?.required_runrate != "" ? <span>{`RRR: ${liveData.required_runrate
            }`}</span> : <></>}
          {liveData?.target != 0 ? <span style={{ padding: "0px 15px" }}>{`Target: ${liveData.target}`}</span> : <></>}
          <span>{`CRR: ${liveData.runrate}`}</span>
        </div>
        <div className={styles.ballEvent}>
          {ballEvent}
        </div>
        <div className={styles.batsmanList}>
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
        </div>
        <div className={styles.ballsOverDiv}>
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
        </div>
        <div className={styles.teamnameDiv}>
          <h2>{teamData.teamb}</h2>
          <span>Bowling</span>
        </div>
      </div>
      <div className={styles.oddsDiv}>
        <div className={styles.header}>
          <h3>Match Odds</h3>
          <button onClick={takeBackBet} style={{ color: "white" }}>cashout</button>
        </div>
        <div className={styles.backLayNameBar}>
          <div>
            <span>Back</span>
            <span>Lay</span>
          </div>
        </div>
        <div>
          {
            oddsData.map((e, i) => {
              return (
                <div key={i} className={styles.oddsComp}>
                  {
                    e?.outcomes.map((f, j) => {
                      return (
                        <OddsMatchComp key={j} f={f} bookmaker={e.bookmaker} meta={metaData} market={e.market} fetchBet={fetchBets} openBets={openBets} />
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
                <p className={styles.betTeamName}>{(e?.selection).slice(0,11)}</p>
                <p className={styles.betOdd}>{e?.lay ? 'lay' : 'back'}</p>
                <p className={styles.betOdd}>{e.odds}</p>
                <p className={styles.betStake}>{e.stake}</p>
              </div>
            })}
          </div>
        </div>
      </div>
      <div className={styles.oddsDiv}>
        <div className={styles.header}>
          <h3>Session Odds</h3>
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
    </div>
  )
}

export default GameComp