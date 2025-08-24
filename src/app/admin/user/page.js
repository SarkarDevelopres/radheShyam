"use client"
import React, { useState, useEffect } from 'react'
import AdminS_ideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
function page() {
    const fetchTotalUsers = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/totalUsersDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log(data.totalUser);
            setEmployeeList([...data.totalUser]);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }
    const [employeeList, setEmployeeList] = useState([
        {_id:9482365, username:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {_id:6363224, username:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {_id:9482452, username:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{_id:63926391, username:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {_id:63456731, username:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {_id:62344513, username:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{_id:9484325, username:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {_id:63456731, username:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {_id:66974513, username:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{_id:9482365, username:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {_id:6363224, username:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {_id:9482452, username:"Test User", email:"testmail@123@gmail.com", phone:7001864357},
    ])

    useEffect(() => {
      fetchTotalUsers();
    }, [])
    
    return (
        <div className={styles.mainDiv}>
            <AdminS_ideBar page={"usr"} />
            <div className={styles.adminMainContent}>
                <h2>Users</h2>
                <div className={styles.employeeSeacrhBar}>
                    <input placeholder='Enter User Name' />
                    <input placeholder='Enter Phone Number' />
                    <input placeholder='Enter Email Address' />
                    <button><MdSearch />Search</button>
                </div>
                <div className={styles.employeeTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>User ID</th>
                                <th>User Name</th>
                                <th>Email Address</th>
                                <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                employeeList.map((e,index)=>{
                                    return <tr className={styles.tableRow} key={index}>
                                        <td>{index+1}</td>
                                        <td>{e._id}</td>
                                        <td>{e.username}</td>
                                        <td>{e.email}</td>
                                        <td>{e.phone}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default page