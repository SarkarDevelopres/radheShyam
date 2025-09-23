"use client"
import React from 'react'
import EmployeeSideBar from '@components/EmployeeSideBar'
import styles from '@/(admin)/admin/admin.module.css'
function Employee() {
    return (
        <div className={styles.mainDiv}>
            <EmployeeSideBar page={"home"} />
            <div className={styles.adminMainContent}>
                <h2>Welcome,</h2>
            </div>
        </div>
    )
}

export default Employee