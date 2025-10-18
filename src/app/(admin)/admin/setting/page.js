"use client"
import React, { useState, useEffect, useRef } from 'react'
import AdminSideBar from '@components/AdminSideBar'
import styles from '../admin.module.css'
import { MdDelete } from "react-icons/md";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export function GameComponent({ id, index, active }) {
    const [isOn, setIsOn] = useState(active);


    const handleToggle = () => {
        setIsOn(prev => !prev);
        console.log('Switch is', !isOn ? 'ON' : 'OFF');
    };
    const deletePromo = () => {
        alert("Sure you wish to delete the PromoCode ?")
    }
    return (
        <div className={styles.gameCompDiv} style={{ borderBottom: "1px solid rgb(255,255,255,0.1)" }}>
            <span>{index + 1}</span>
            <span className={styles.gameCompData}>{id}</span>
            <div className={styles.promoActionBtnsDiv}>
                <label className={styles.switch}>
                    <input type="checkbox" checked={isOn} onChange={handleToggle} />
                    <span className={styles.slider}></span>
                </label>
                <MdDelete onClick={deletePromo} />
            </div>
        </div>
    )
}

function Setting() {
    const router = useRouter();
    const [promoCodeList, setPromoCOdeList] = useState([{ PromoCode: "FIRST200", active: true }, { PromoCode: "WELCOME4412", active: true }, { PromoCode: 4928, active: true }, { PromoCode: 4319, active: true }, { PromoCode: 4319, active: true }, { PromoCode: 4583, active: true }]);

    const [isMaintiance, setIsMaintiance] = useState(false);
    const [maintianceReason, setMaintianceReason] = useState("");
    const [maintianceHeading, setMaintianceHeading] = useState("");
    const [maintianceTime, setMaintianceTime] = useState(0);
    const btnSpan = useRef(null);
    const btnRef = useRef(null);

    const fetchMaintainceData = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/checkmaintainance`);

            let res = await req.json();
            console.log(res);

            if (res.ok) {
                setIsMaintiance(res.isMaintenance);
                if (res.isMaintenance) {
                    btnRef.current.style.backgroundColor = "#009320ff";
                    btnSpan.current.style.marginLeft = "60px";
                    setMaintianceTime(res.duration);
                    setMaintianceReason(res.string);
                    setMaintianceHeading(res.heading);
                }
            }
        } catch (error) {
            toast.error('Error fetching data from server.')
        }
    }

    const toggelMaintance = () => {
        if (!isMaintiance) {
            btnRef.current.style.backgroundColor = "#009320ff";
            btnSpan.current.style.marginLeft = "60px";
            setIsMaintiance(true)
        } else {
            setIsMaintiance(false)
            btnRef.current.style.backgroundColor = "#007deb";
            btnSpan.current.style.marginLeft = "0px";
        }
    }

    const updateMaintaince = async () => {
        let confirmDecision = confirm(isMaintiance ? "Turn ON Maintaince?" : "Turn OFF Maintiance ?");

        if (confirmDecision) {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) {
                toast.error("Invalid access !");
                localStorage.clear();
                router.push("/admin/login")
            }
            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/setmaintainance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${adminToken}`,   // or other content type if needed
                },
                body: JSON.stringify({
                    "isOn": isMaintiance,
                    "duration": parseFloat(maintianceTime),
                    "string": maintianceReason,
                    "heading": maintianceHeading,
                })
            });
            // "2025-09-22T13:43:12.372Z"
            let res = await req.json();

            if (res.ok) {
                toast.success("Maintaince Updated !");
                setIsMaintiance(res.data.isOn);
                setMaintianceTime(res.data.duration);
                setMaintianceReason(res.data.string);
                setMaintianceHeading(res.data.heading);
            }
            else {
                toast.error(`${res.message}`);
            }
        }

    }
    useEffect(() => {
        fetchMaintainceData();
    }, [])


    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"set"} />
            <div className={styles.adminMainContent}>
                <h2>Settings</h2>
                <div className={styles.settingsZone}>
                    <div className={styles.containerDiv}>
                        <h3>Coin & Currency Settings</h3>
                        <div className={styles.detailsDataList}>
                            <div className={styles.individualDataComp}>
                                <p>INR to Coin Rate Ratio </p>
                                <div>
                                    <input placeholder="Fill as 1:10 format" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Minimum Withdrawl Limit </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Maximum Withdrawl per Day </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className={styles.containerDiv}>
                        <h3>Maintaince Mode</h3>
                        <div className={`${styles.detailsDataList} ${styles.maintainceBox}`}>
                            {/* <div className={styles.individualDataComp}>
                                <p>Maintenance Duration </p>
                                <div>
                                    <input placeholder="Input in sec" value={maintianceTime} onChange={(e) => setMaintianceTime(e.target.value)} />
                                </div>
                            </div> */}
                            <div className={styles.individualDataComp}>
                                <p>Maintenance Heading </p>
                                <div>
                                    <input placeholder="Type reason" value={maintianceHeading} onChange={(e) => setMaintianceHeading(e.target.value)} />
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Maintenance Reason </p>
                                <div>
                                    <input placeholder="Type reason" value={maintianceReason} onChange={(e) => setMaintianceReason(e.target.value)} />
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Maintenance Duration</p>
                                <div className={styles.maintainceDiv}>
                                     <input placeholder="Input in sec" value={maintianceTime} onChange={(e) => setMaintianceTime(e.target.value)} style={{width:"25%"}} />
                                    <button
                                        className={styles.maintainceDivBtn}
                                        onClick={toggelMaintance}
                                        ref={btnRef}
                                    >
                                        <span
                                            className={styles.buttonSpan}
                                            ref={btnSpan}
                                        ></span>
                                    </button>
                                    <button onClick={updateMaintaince}>Save</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className={styles.settingsZone}>
                    <div className={styles.containerDiv}>
                        <h3>Referral & Bonuses</h3>
                        <div className={styles.detailsDataList}>
                            <div className={styles.individualDataComp}>
                                <p>Referrer Bonus User </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Invitee Bonus User </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>First recharge Bonus </p>
                                <div>
                                    <input placeholder="Input in Coins" />
                                    <button>Save</button>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className={styles.containerDiv}>
                        <h3>Add Promo Code</h3>
                        <div className={styles.detailsDataList}>
                            <div className={styles.individualDataComp}>
                                <input className={styles.addPromoInput} placeholder="Add Promo Code" />

                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Promo Condition: </p>
                                <div>
                                    <select>
                                        <option>First 500 Games</option>
                                        <option>First 1,000 Games</option>
                                        <option>Spent 500/-</option>
                                        <option>Spent 1,000/-</option>
                                        <option>Referred 20</option>
                                        <option>Referred 50</option>
                                        <option>Referred 100</option>
                                    </select>
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Promo Bonus: </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.buttonAddDiv}>
                                <button className={styles.addPromoBtn} >Save</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Setting