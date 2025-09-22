"use client"
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"
import { Spinner } from "react-bootstrap";
import Footer from "./Footer";

function MaintainanceScreen({ duration, startedAt }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const start = new Date(startedAt).getTime();
        const end = start + duration * 60 * 60 * 1000;

        const updateRemaining = () => {
            const now = Date.now();
            const diff = end - now;
            setRemaining(diff > 0 ? diff : 0);
        };

        updateRemaining(); // run immediately
        const interval = setInterval(updateRemaining, 1000);

        return () => clearInterval(interval);
    }, [duration, startedAt]);

    // Convert ms → hh:mm:ss
    const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
    const seconds = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, "0");

    return (
        <div>
            <Navbar maintainance={true} />
        <div
                style={{
                    width: "100%",
                    height: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "200px 50px"
                }}
            >

                <Spinner style={{ height: "50px", width: "50px" }} />
                <h1 style={{ color: "#02D4F4", textAlign: "center", margin: "20px 0px" }}>
                    Server is under maintenance<br />
                </h1>
                <h3>Remaining time: {hours}:{minutes}:{seconds}</h3>
            </div>
            <Footer maintainance={true}/>
        </div>
    );
}

export default MaintainanceScreen;
