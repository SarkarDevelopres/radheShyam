"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import styles from '@/(main)/sports/[id]/sportStyles.module.css'
import { useRouter } from 'next/navigation';
import { cashoutForTeam } from "../lib/cashout";
import { toast } from "react-toastify";

export function OddsMatchComp({ f, meta = "", bookmaker = "", market = "", fetchBet, openBets, matchData, profitLoss = 0, noBets, setBets }) {

  const router = useRouter();
  const [showStake, setShowStake] = useState(false);
  const [amount, chooseAmount] = useState(null);
  const [customStake, setCustomStake] = useState("");
  const [odds, setOdds] = useState('');
  const [team, setTeam] = useState('');
  const [lay, setLay] = useState(false);

  const payout = useMemo(() => {
    // oddsBook must be keyed by team name
    const price = f.price ?? 0;
    const oddsBook = {
      [f.name]: {
        back: price,
        lay: (price / 0.99).toFixed(2)
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

  const placeBet = async () => {
    const loggedIn = isLoggedIn();
    if (!loggedIn) {
      alert("Log In to place bets!");
      router.push('/login');
      return; // stop here
    }

    if (!f.price) {
      toast.error(`Cannot place bets !`)
      return;
    }

    if (noBets) {
      toast.error(`Undefined !`)
      return;
    }
    let teamId = null;
    if (matchData.teamHome?.name === team) {
      teamId = matchData.teamHome.team_id;
    } else if (matchData.teamAway?.name === team) {
      teamId = matchData.teamAway.team_id;
    }

    let amnt = customStake ? parseInt(customStake) : amount;
    let deductAmnt = amnt;
    // if (lay == true) {
    //   deductAmnt = Math.round(parseFloat(odds) * parseInt(amount));
    // }
    if (lay) {
      // For lay bet: your risk (liability)
      let liability = (parseFloat(odds) - 1) * amnt;
      deductAmnt = Math.round(liability);
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
        selection: teamId,
        selectionName: team,
        stake: amnt,
        minusAmnt: deductAmnt,
        odds: odds,
        lay: lay,
      }),
    });

    const payload = await response.json();
    console.log(payload);
    
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
        <div className={styles.playerNameDiv}>
          <p>{(f.name).slice(0, 11)}</p>
          <p style={{ color: (profitLoss + Number(payout.profitNow)) < 0 ? "red" : "rgba(0, 243, 0, 1)", fontWeight: 400 }} >{(profitLoss + Number(payout.profitNow)).toFixed(2)}</p>
        </div>
        {/* {
          <span style={{ color: payout.profitNow < 0 ? "red" : "rgba(0, 243, 0, 1)" }}>{payout.profitNow}</span>
        } */}
        <div className={styles.betButtons}>
          <button onClick={() => {
            setLay(false)
            setShowStake(true)
            setOdds(parseFloat(f.price).toFixed(2))
            setTeam(f.name)
          }}>{f.price ? f.price : 0.00}</button>
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
          {amount && odds ? <span style={{ color: !lay ? "rgba(0, 243, 0, 1)" : "red" }}>
          {!lay
            ? ((odds - 1) * amount).toFixed(2) // back profit
            : ((odds - 1) * amount).toFixed(2) // lay liability
          }
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
