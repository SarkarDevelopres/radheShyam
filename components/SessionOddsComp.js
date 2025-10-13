"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from '@/(main)/sports/[id]/sportStyles.module.css'
import { useRouter } from 'next/navigation';

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