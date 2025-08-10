"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from './style.module.css'
import OddComponent from '../../../components/OddComponent';
function Sports() {
    const [activeSports, setActiveSports] = useState("cricket");
    const cricket = useRef(null);
    const football = useRef(null);
    const tennis = useRef(null);
    const capsule = useRef(null);


    const handleSportsChange = (v) => {
        if (v == "Cricket") {
            cricket.current.style.color = "#00224E";
            football.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "0%";
            setActiveSports("cricket")
        }
        else if (v == "Football") {
            football.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "33.33%";
            setActiveSports("soccer")
        }
        else {
            tennis.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            football.current.style.color = "#02D4F4";
            capsule.current.style.left = "66.99%";
            setActiveSports("tennis")
        }
    }

    const fetchData = async () => {
        console.log(activeSports);
        let req = await fetch(`https://api.the-odds-api.com/v4/sports/${activeSports}/odds/?regions=uk&markets=h2h&apiKey=${process.env.NEXT_PUBLIC_ODDS_API}`);

        let res = await req.json();
        console.log(res);


    }

    useEffect(() => {
        fetchData();
    }, [activeSports])

    return (
        <div className={styles.mainDiv}>
            <h2>In-Play</h2>
            <div className={styles.sportsBar}>
                <div className={styles.sportsSelectBar}>
                    <span className={styles.capsule} ref={capsule}></span>
                    <div className={styles.sportName} ref={cricket} onClick={(e) => handleSportsChange(e.target.innerText)}>Cricket</div>
                    <div className={styles.sportName} ref={football} onClick={(e) => handleSportsChange(e.target.innerText)}>Football</div>
                    <div className={styles.sportName} ref={tennis} onClick={(e) => handleSportsChange(e.target.innerText)}>Tennis</div>
                </div>
            </div>
            <div className={styles.betsList}>
                <div className={styles.oddsGroup}>
                    <OddComponent />
                    <OddComponent />
                    <OddComponent />
                    <OddComponent />
                    <OddComponent />
                </div>
            </div>
        </div>
    )
}

export default Sports