"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { IoMdCloseCircle } from "react-icons/io";

export function EmpModal({ empData, closeWindow, fetchUsers }) {
    const [deductAmnt, setDeductAmnt] = useState(null);
    const [addAmnt, setAddAmnt] = useState(null);
    
    const deleteUser = async () => {

        let confirmDelete = confirm("Permenantly delete employee ?");

        if (confirmDelete) {

            let adminToken = localStorage.getItem('adminToken');

            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/deleteEmp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                },
                body: JSON.stringify({
                    "empId": empData.id
                })
            });
            let res = await req.json();

            if (res.ok) {
                toast.success(`${res.message}`)
                fetchUsers();
                closeWindow();
            }

            else toast.error(`${res.message}`);
        }
    }

    return (
        <div className={styles.userModalWrapper}>
            <div className={styles.userModalDiv}>
                <IoMdCloseCircle onClick={() => closeWindow()} />
                <div className={styles.modalDetailsDiv}>
                    <div className={styles.detailsField}>
                        <span>Name:</span>
                        <p>{empData.name}</p>
                    </div>
                    <div className={styles.detailsField}>
                        <span>Phone:</span>
                        <p>{empData.phone}</p>
                    </div>
                    <div className={styles.detailsField}>
                        <span>Email:</span>
                        <p>{empData.email}</p>
                    </div>
                    {/* <div className={styles.detailsField}>
                        <span>Coins:</span>
                        <p>{userData.balance}</p>
                    </div> */}
                </div>
                <button onClick={deleteUser} className={styles.modalDeleteBtn}>Delete User</button>
            </div>
        </div>
    )
}


function EmpPage() {
    const router = useRouter();
    const fetchTotalUsers = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("No admin token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/totalEmployeeDetails`, {
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
            console.log(data.totalEmployee);
            setEmployeeList([...data.totalEmployee]);
        } catch (err) {
            console.error("Fetch error:", err);
            return null;
        }
    }
    const [employeeList, setEmployeeList] = useState([])

    const [empData, setEmpData] = useState({
        name: "",
        phone: null,
        password: "",
        email:""
    })
    const [currentUser, setCurrentUser] = useState({})
    const [showUserModal, setShowUserModal] = useState(false)
    const [searchData, setSearchData] = useState({ name: "", phone: null, email: "" });

    const addEmp = async () => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) throw new Error("No admin token found");

        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/createEmp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,   // send token in header
            },
            body: JSON.stringify({
                "name": empData.name,
                "phone": empData.phone,
                "email": empData.email,
                "password": empData.password,
            })
        });

        const res = await req.json();
        console.log(res);
        if (res.ok) {
            toast.success(`${res.message}`);
            fetchTotalUsers()
        } else {
            toast.error(`${res.message}`);
        }
    }

    const fetchSingleUser = async () => {

        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/findSingleUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": searchData.username,
                "phone": searchData.phone,
                "email": searchData.email,
            })
        });

        const res = await req.json();
        console.log(res);
        if (res.ok) {
            toast.success(`${res.message}`);
            setEmployeeList([{ ...res.user }])
            setSearchData({ username: "", phone: null, email: "" })
        } else {
            toast.error(`${res.message}`);
        }
    }
    useEffect(() => {
        fetchTotalUsers();
    }, [])

    return (
        <div className={styles.mainDiv}>
            <AdminSideBar page={"usr"} />
            <div className={styles.adminMainContent}>
                {
                    showUserModal && <EmpModal empData={currentUser} closeWindow={() => setShowUserModal(false)} fetchUsers={fetchTotalUsers} />
                }
                <h2>Users</h2>
                <div className={styles.employeeSeacrhBar}>
                    <input placeholder='Enter Employee ID' value={searchData.email} onChange={(e) => setSearchData((p) => ({ ...p, email: e.target.value }))} />
                    <input placeholder='Enter Employee Name' value={searchData.username} onChange={(e) => setSearchData((p) => ({ ...p, username: e.target.value }))} />
                    <input placeholder='Enter Employee Number' value={searchData.phone} onChange={(e) => setSearchData((p) => ({ ...p, phone: e.target.value }))} />
                    <button onClick={fetchSingleUser}><MdSearch />Search</button>
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
                                employeeList.map((e, index) => {
                                    return (
                                        <tr
                                            onClick={() => {
                                                setCurrentUser({ id: e._id, name: e.name, phone: e.phone, email:e.email }),
                                                    setShowUserModal(true)
                                            }}
                                            className={styles.tableRow}
                                            key={index}
                                        >
                                            <td>{index + 1}</td>
                                            <td>{e.employee_id}</td>
                                            <td>{e.name}</td>
                                            <td>{e.email}</td>
                                            <td>{e.phone}</td>
                                        </tr>)
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className={styles.addUserContainer}>
                    <h3>Add Employee</h3>
                    <div className={styles.addUserDiv}>
                        <div className={styles.inputDiv}>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={empData.name}
                                onChange={(e) =>
                                    setEmpData((p) => ({ ...p, name: e.target.value }))
                                }
                            />
                            <input
                                type="number"
                                placeholder="Enter Phone"
                                value={empData.phone}
                                onChange={(e) =>
                                    setEmpData((p) => ({ ...p, phone: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.inputDiv}>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={empData.password}
                                onChange={(e) =>
                                    setEmpData((p) => ({ ...p, password: e.target.value }))
                                }
                            />
                            <input
                                type="email"
                                placeholder="Enter Email"
                                value={empData.email}
                                onChange={(e) =>
                                    setEmpData((p) => ({ ...p, email: e.target.value }))
                                }
                            />
                            <button onClick={addEmp}>Add Employee</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default EmpPage