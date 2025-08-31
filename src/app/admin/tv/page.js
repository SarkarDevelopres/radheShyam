"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

function EventComp(){
    return(
        <div>
            <p></p>
        </div>
    )
}

function LiveTv() {
    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"usr"} />
            <div className={styles.adminMainContent}>
                <h2>Live TV</h2>
                <div className={styles.eventsListDiv}>

                </div>
            </div>
        </div>
    )
}

export default LiveTv