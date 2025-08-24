"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'

import { MdSearch } from "react-icons/md";

function Transaction() {
  const [transactionList, setTransactionList] = useState([])

  // totalTransactionDetails
  const fetchTotalTransactions = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) throw new Error("No admin token found");

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/totalTransactionDetails`, {
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
      setTransactionList([...data.totalTransaction]);
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  }

  useEffect(() => {
    fetchTotalTransactions()
  }, [])

  return (
    <div className={styles.mainDiv}>
      <AdminSideBar page={"trans"} />
      <div className={styles.adminMainContent}>
        <h2>Transactions</h2>
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
                <th>Transaction ID</th>
                <th>Process Name</th>
                <th>Amount</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {
                transactionList.map((e, index) => {
                  return <tr className={styles.tableRow} key={index}>
                    <td>{index + 1}</td>
                    <td>{e._id}</td>
                    <td>{e.type}</td>
                    <td>{-(e.amount)}</td>
                    <td>{e.createdAt}</td>
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

export default Transaction