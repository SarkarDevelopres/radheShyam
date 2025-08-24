"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdDelete } from "react-icons/md";

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
    const [promoCodeList, setPromoCOdeList] = useState([{ PromoCode: "FIRST200", active: true }, { PromoCode: "WELCOME4412", active: true }, { PromoCode: 4928, active: true }, { PromoCode: 4319, active: true }, { PromoCode: 4319, active: true }, { PromoCode: 4583, active: true }])
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
                        <h3>Gameplay Rules</h3>
                        <div className={styles.detailsDataList}>
                            <div className={styles.individualDataComp}>
                                <p>Auto-win on player exit </p>
                                <div>
                                    <input placeholder="Input in sec" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Disconnection timeout </p>
                                <div>
                                    <input placeholder="Input in INR" />
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className={styles.individualDataComp}>
                                <p>Maintenance Mode Toggle </p>
                                <div>
                                    <input placeholder="Enter Percentage" />
                                    <button>Save</button>
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
                <div className={styles.settingsZone}>
                    <div className={styles.promoListDiv}>
                        <h3 className={styles.promoListH3}>Promo Code List</h3>
                        <div className={styles.gameCompDiv} style={{ backgroundColor: "#231a2b" }}>
                            <span className={styles.gameCompData}>Sl No</span>
                            <span className={styles.gameCompData}>PromoCode</span>
                            <span className={styles.gameCompData} style={{paddingRight:40}}>Actions</span>
                        </div>
                        <div className={styles.promoListContainer}>

                            {
                                promoCodeList.map((e, index) => {
                                    return <GameComponent key={index} index={index} id={e.PromoCode} active={e.active} />
                                })
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Setting