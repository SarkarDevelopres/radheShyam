import React, { useState, useRef } from 'react'
import styles from "./styles/odd.module.css";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
function OddComponent({ data }) {
    console.log(data);
    
    const [amnt, setAmnt] = useState(0);
    const [team, setTeam] = useState(null);
    const [showStake, setShowStake] = useState(false);
    const [customStake, setCustomStake] = useState(null);
    const router = useRouter();
    const moveIt = () => {
        // router.push(`/sports/game/${data.matchId}`)
        console.log("Pushed called");

    }
    const isLoggedIn = () => {
        if (typeof window === "undefined") return false;
        let userToken = localStorage.getItem("userToken");
        return userToken || false;
    }
    const chooseAmount = (amt) => {
        setAmnt(amt)
    }
    const chooseTeam = (index) => {
        setShowStake(true);
        setTeam(index)
    }

    async function placeBet() {
        const loggedIn = isLoggedIn();
        if (!loggedIn) {
            alert("Log In to place bets!");
            router.push('/login');
            return; // stop here
        }

        const odds = data.odds[team].price;
        const amount = customStake?parseInt(customStake):amnt;

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loggedIn}`,
            },
            body: JSON.stringify({
                token: loggedIn,
                matchId: data.matchId,
                title: data.title,
                market: data.market,
                bookmakerKey: data.bookmakerKey,
                selection: data.odds[team].name,
                stake: amount,
                odds,
            }),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            alert(payload?.error || 'Failed');
            return;
        }

        if (response.ok) {
            console.log(response);
            
            toast.success(`Bet Placed of ${customStake?customStake:amnt}!`);
            setAmnt(0);
            setTeam(null);
            setShowStake(false);
        }

        // If you use Server Components / data fetching on the page:
        //   router.refresh();

        // If you need a hard reload instead:
        // window.location.reload();
    }

    const cancel = () => {
        setAmnt(0);
        setTeam(null);
        setShowStake(false);
    }
     const goToMatchPage = () => {
        localStorage.setItem("home",data.teamHome.name);
        localStorage.setItem("away",data.teamAway.name);
        localStorage.setItem("matchId",data.matchId);
        localStorage.setItem("status",data.status);
        router.push(`/sports/${data.matchId}`)
     }
    return (
        <div className={styles.oddMainComp} onClick={() => moveIt()}>
            <div className={styles.OddDetails}>
                <span className={styles.liveIndicator} style={{backgroundColor:data.status=="live"?"#00b728":"#a0a0a0ff"}} />
                <div className={styles.teamMatchDetails} >
                    <p onClick={goToMatchPage}>{`${data.teamHome.name} vs ${data.teamAway.name}`}</p>
                    <span>{`${data.start_time} | ${data.title}`}</span>
                </div>
            </div>
            <div className={styles.OddData}>
                <div className={styles.oddsPair}>
                    {
                        data.odds.map((e, i) => {
                            return <button
                                key={i}
                                onClick={() => chooseTeam(i)}
                                className={team === i ? styles.selectedTeam : ""}
                            >
                                {e.price?e.price:0}
                            </button>
                        })
                    }
                </div>
            </div>
            {
                showStake && <div className={styles.stakeWrapper}>
                    <div className={styles.inputDiv}>
                        <input type="number" value={customStake} onChange={(e)=>setCustomStake(e.target.value)}/>
                    </div>
                    <div className={styles.stakeChoice} style={{ flexWrap: "wrap" }}>
                        {[100, 300, 500, 1000, 3000, 5000, 10000, 50000, 100000].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => chooseAmount(amt)}
                                className={amnt === amt ? styles.selectedStake : ""}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                    <div className={styles.placeBtn}>
                        <button onClick={() => placeBet()}>Place Bet</button>
                        <button onClick={() => cancel()}>Cancel</button>
                    </div>
                </div>
            }

        </div>
    )
}

export default OddComponent