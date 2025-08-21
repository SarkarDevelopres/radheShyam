import React, { useState, useRef } from 'react'
import styles from "./styles/odd.module.css"
import { useRouter } from 'next/navigation';
function OddComponent({ data }) {
    const [amnt, setAmnt] = useState(0);
    const [team, setTeam] = useState(null);
    const [showStake, setShowStake] = useState(false);
    const router = useRouter();
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loggedIn}`,
            },
            body: JSON.stringify({
                token: loggedIn,
                matchId: data.matchId,
                selection: data.odds[team].name,
                stake: amnt,
                odds,
            }),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            alert(payload?.error || 'Failed');
            return;
        }

        // If you use Server Components / data fetching on the page:
        //   router.refresh();

        // If you need a hard reload instead:
        window.location.reload();
    }

    const cancel = () => {
        setAmnt(0);
        setTeam(null);
        setShowStake(false);
    }

    return (
        <div className={styles.oddMainComp}>
            <div className={styles.OddDetails}>
                <span className={styles.liveIndicator} />
                <div className={styles.teamMatchDetails}>
                    <p>{`${data.home} vs ${data.away}`}</p>
                    <span>{`${data.displayableTime} | ${data.title}`}</span>
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
                                {e.price}
                            </button>
                        })
                    }
                </div>
            </div>
            {
                showStake && <div>
                    <div className={styles.stakeChoice}>
                        {[100, 200, 300, 400, 500, 1000].map((amt) => (
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