"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from './style.module.css'
import OddComponent from '../../../components/OddComponent';
function ClientView({initialData}) {
    console.log(initialData);
    
    const [activeSports, setActiveSports] = useState("cricket");
    const [oddsData, setOddsData] = useState(initialData.data)
    const cricket = useRef(null);
    const football = useRef(null);
    const tennis = useRef(null);
    const capsule = useRef(null);
    const router = useRouter();


    const handleSportsChange = (v) => {
        if (v == "Cricket") {
            cricket.current.style.color = "#00224E";
            football.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "0%";
            setActiveSports("cricket");
            fetchData("cricket");
        }
        else if (v == "Football") {
            football.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "33.33%";
            setActiveSports("soccer");
            fetchData("soccer");
        }
        else {
            tennis.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            football.current.style.color = "#02D4F4";
            capsule.current.style.left = "66.99%";
            setActiveSports("tennis")
            fetchData("tennis");
        }
    }

    const fetchData = async (sports) => {
        console.log(sports);
        
        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/${sports}`);

        let res = await req.json();
        if (res.success) {
            setOddsData([...res.data]);
        }
        else{
            alert(res.error);
            router.refresh();
        }


    }

    useEffect(() => {
    }, [])

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
                    {oddsData.map((e,i)=>{
                        return <OddComponent key={i} data={e} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default ClientView