"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from './style.module.css'
import OddComponent from '@components/OddComponent';
import { BiSolidCricketBall } from "react-icons/bi";
import Loading from '@components/Loading';
import { IoMdFootball, IoIosTennisball, IoIosBasketball, IoIosBaseball } from "react-icons/io";
import { Spinner } from 'react-bootstrap'
function ClientView({ initialData }) {
    const [activeSports, setActiveSports] = useState("Cricket");
    const [oddsData, setOddsData] = useState(initialData.data)
    const cricket = useRef(null);
    const football = useRef(null);
    const tennis = useRef(null);
    const basketball = useRef(null);
    const baseball = useRef(null);
    const capsule = useRef(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)


    const handleSportsChange = (v) => {
        if (v == "cricket") {
            cricket.current.style.color = "#00224E";
            football.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "0%";
            setActiveSports("Cricket");
            fetchData("cricket");
        }
        else if (v == "football") {
            football.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            tennis.current.style.color = "#02D4F4";
            capsule.current.style.left = "20%";
            setActiveSports("Football");
            fetchData("soccer");
        }
        else if (v == 'tennis') {
            tennis.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            football.current.style.color = "#02D4F4";
            capsule.current.style.left = "40%";
            setActiveSports("Tennis")
            fetchData("tennis");
        }
        else if (v == 'basketball') {
            tennis.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            football.current.style.color = "#02D4F4";
            capsule.current.style.left = "60%";
            setActiveSports("Basketball")
            fetchData("basketball");
        }
        else if (v == 'baseball') {
            tennis.current.style.color = "#00224E";
            cricket.current.style.color = "#02D4F4";
            football.current.style.color = "#02D4F4";
            capsule.current.style.left = "80%";
            setActiveSports("Baseball")
            fetchData("baseball");
        }
    }

    const fetchData = async (sports) => {
        console.log("SPORTS: ", sports);
        setIsLoading(true)

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/${sports}`);

        let res = await req.json();
        if (res.success) {
            setOddsData([...res.data]);
            setIsLoading(false)
        }
        else {
            console.log(res);

            router.refresh();
        }


    }
    const [timeLeft, setTimeLeft] = useState(5 * 60 * 60); // 5 hours in seconds

    useEffect(() => {
        if (activeSports === "Tennis") {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeSports]);

    // Convert seconds → hh:mm:ss
    const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className={styles.mainDiv}>
            {isLoading && <Loading />}
            <h2 style={{ color: "#02d4f4" }}>Sports</h2>
            <div className={styles.sportsBar}>
                <div className={styles.sportsSelectBar}>
                    <span className={styles.capsule} ref={capsule}></span>
                    <div className={styles.sportName} ref={cricket} onClick={() => handleSportsChange("cricket")}><BiSolidCricketBall color={"red"} /></div>
                    <div className={styles.sportName} ref={football} onClick={() => handleSportsChange("football")}><IoMdFootball color={"white"} /></div>
                    <div className={styles.sportName} ref={tennis} onClick={() => handleSportsChange("tennis")}><IoIosTennisball color={"lime"} /></div>
                    <div className={styles.sportName} ref={basketball} onClick={() => handleSportsChange("basketball")}><IoIosBasketball color={"orange"} /></div>
                    <div className={styles.sportName} ref={baseball} onClick={() => handleSportsChange("baseball")}><IoIosBaseball color={"white"} style={{ backgroundColor: "red", borderRadius: "50%" }} /></div>
                </div>
            </div>
            <h3>{activeSports}</h3>
            <div className={styles.betsList}>
                {activeSports === "Cricket" || activeSports === "Tennis" ? (
                    <div className={styles.oddsGroup}>
                        {oddsData.map((e, i) => (
                            <OddComponent key={i} data={e} sport={activeSports} />
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "70px 10px",
                            width: "100%",
                            borderRadius: "10px",
                            backgroundColor: "#012167",
                        }}
                    >
                        <Spinner style={{ marginBottom: "20px" }} />
                        <h4>{`${activeSports} is still being added`}</h4>
                        <p style={{ fontSize: "10px" }}>
                           {" We're adding the rest 4 sports, thanks for your patience!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClientView