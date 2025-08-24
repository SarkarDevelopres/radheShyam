"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
function page() {
    const [employeeList, setEmployeeList] = useState([
        {id:63926391, name:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {id:63456731, name:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {id:66974513, name:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{id:63926391, name:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {id:63456731, name:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {id:66974513, name:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{id:63926391, name:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {id:63456731, name:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {id:66974513, name:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{id:63926391, name:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {id:63456731, name:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {id:66974513, name:"Test User", email:"testmail@123@gmail.com", phone:7001864357},{id:63926391, name:"Nawed Arshad", email:"nawedarshad123@gmail.com", phone:973200290}, {id:63456731, name:"Sagnik Sarkar", email:"sagniksarkar123@gmail.com", phone:7001809047},
        {id:66974513, name:"Test User", email:"testmail@123@gmail.com", phone:7001864357}
    ])
    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"emp"} />
            <div className={styles.adminMainContent}>
                <h2>Employees</h2>
                <div className={styles.employeeSeacrhBar}>
                    <input placeholder='Enter Employee Code' />
                    <input placeholder='Enter Phone Number' />
                    <input placeholder='Enter Email Address' />
                    <button><MdSearch />Search</button>
                </div>
                <div className={styles.employeeTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Employee ID</th>
                                <th>Employee Name</th>
                                <th>Email Address</th>
                                <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                employeeList.map((e,index)=>{
                                    return <tr className={styles.tableRow} key={index}>
                                        <td>{index+1}</td>
                                        <td>{e.id}</td>
                                        <td>{e.name}</td>
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