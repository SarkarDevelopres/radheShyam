"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

function EventComp({ data, fetchData }) {
    const [linkType, setLinkType] = useState(data.streamLink? data.streamLink.type : "iframe");
    const [inputValue, setInputValue] = useState(data.streamLink? data.streamLink.link : "");

    const UpdateStreamValue = async () => {

        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) throw new Error("No admin token found");

        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/updateOddsStream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,   // send token in header
            },
            body: JSON.stringify({
                "id": data._id,
                "streamLink": inputValue,
                "linkType": linkType,
            })
        });

        const res = await req.json();
        console.log(res);
        if (res.ok) {
            toast.success(`${res.message}`);
            fetchData()
        } else {
            toast.error(`${res.message}`);
        }
    }
    return (

        <div className={styles.gameListDiv}>
            <span>{data.title}</span>
            <div className={styles.inputDiv}>
                <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <select value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                    <option value={"iframe"}>iframe</option>
                    <option value={"link"} >link</option>
                </select>
                <button onClick={UpdateStreamValue}>Change</button>
            </div>
        </div>
    )
}

function LiveTv() {

    const [gameslist, setGameslist] = useState([]);

    const fetchOddsData = async () => {

        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) throw new Error("No admin token found");

        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/getLiveOdds`);

        let res = await req.json();

        console.log(res);

        if (res.ok) {
            setGameslist([...res.data])
        }

    }

    useEffect(() => {
        fetchOddsData();
    }, [])

    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"usr"} />
            <div className={styles.adminMainContent}>
                <h2>Live TV</h2>
                <div className={styles.eventsListDiv}>
                    {
                        gameslist.map((e, i) => {
                            return (
                                <EventComp key={i} data={e} fetchData={()=>fetchOddsData()} />
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default LiveTv