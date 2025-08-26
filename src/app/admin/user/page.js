"use client"
import React, { useState, useEffect } from 'react'
import AdminS_ideBar from '../../../../components/AdminSideBar'
import styles from '../admin.module.css'
import { MdSearch } from "react-icons/md";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { IoMdCloseCircle } from "react-icons/io";


export function UserModal({ userData, closeWindow, fetchUsers }) {
    const [deductAmnt, setDeductAmnt] = useState(null);
    const [addAmnt, setAddAmnt] = useState(null);
    const deductCoins = async () => {

        let adminToken = localStorage.getItem('adminToken');

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/deductCoinsFromUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,   // send token in header
            },
            body: JSON.stringify({
                "userId": userData.id,
                "coins": deductAmnt
            })
        });
        let res = await req.json();

        if (res.ok) {
            toast.success(`${res.message}`)
            fetchUsers();
        }

        else toast.error(`${res.message}`);

    }
    const addCoins = async () => {

        let adminToken = localStorage.getItem('adminToken');

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/addCoinsToUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,   // send token in header
            },
            body: JSON.stringify({
                "userId": userData.id,
                "coins": addAmnt
            })
        });
        let res = await req.json();

        if (res.ok) {
            toast.success(`${res.message}`)
            fetchUsers();
        }

        else toast.error(`${res.message}`);

    }
    const deleteUser = async () => {

        let confirmDelete = confirm("Permenantly delete user ?");

        if (confirmDelete) {

            let adminToken = localStorage.getItem('adminToken');

            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/deleteUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                },
                body: JSON.stringify({
                    "userId": userData.id
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
                        <p>{userData.name}</p>
                    </div>
                    <div className={styles.detailsField}>
                        <span>Phone:</span>
                        <p>{userData.phone}</p>
                    </div>
                    <div className={styles.detailsField}>
                        <span>Coins:</span>
                        <p>{userData.balance}</p>
                    </div>
                </div>
                <div className={styles.modalInputfields}>
                    <input type='number' value={addAmnt} onChange={(e) => setAddAmnt(e.target.value)} />
                    <button onClick={addCoins} >Add Coins</button>
                </div>
                <div className={styles.modalInputfields}>
                    <input type='number' value={deductAmnt} onChange={(e) => setDeductAmnt(e.target.value)} />
                    <button onClick={deductCoins} >Deduct Coins</button>
                </div>
                <button onClick={deleteUser} className={styles.modalDeleteBtn}>Delete User</button>
            </div>
        </div>
    )
}

function page() {
    const router = useRouter();
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
    const [employeeList, setEmployeeList] = useState([])

    const [userData, setUserData] = useState({
        username: "",
        phone: null,
        password: ""
    })
    const [currentUser, setCurrentUser] = useState({})
    const [showUserModal, setShowUserModal] = useState(false)
    const [searchData, setSearchData] = useState({username:"",phone:null,email:""});

    const addUser = async () => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) throw new Error("No admin token found");

        const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/createUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,   // send token in header
            },
            body: JSON.stringify({
                "username": userData.username,
                "phone": userData.phone,
                "password": userData.password,
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
    
    const fetchSingleUser =  async() => {

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
            setEmployeeList([{...res.user}])
            setSearchData({username:"",phone:null,email:""})
        } else {
            toast.error(`${res.message}`);
        }
    }
    useEffect(() => {
        fetchTotalUsers();
    }, [])

    return (
        <div className={styles.mainDiv}>
            <AdminS_ideBar page={"usr"} />
            <div className={styles.adminMainContent}>
                {
                    showUserModal && <UserModal userData={currentUser} closeWindow={() => setShowUserModal(false)} fetchUsers={fetchTotalUsers} />
                }
                <h2>Users</h2>
                <div className={styles.employeeSeacrhBar}>
                    <input placeholder='Enter User Name' value={searchData.username} onChange={(e)=>setSearchData((p)=>({...p, username: e.target.value}))}/>
                    <input placeholder='Enter Phone Number' value={searchData.phone} onChange={(e)=>setSearchData((p)=>({...p, phone: e.target.value}))}/>
                    <input placeholder='Enter Email Address' value={searchData.email} onChange={(e)=>setSearchData((p)=>({...p, email: e.target.value}))}/>
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
                                                setCurrentUser({ id: e._id, name: e.username, phone: e.phone, balance: e.balance }),
                                                    setShowUserModal(true)
                                            }}
                                            className={styles.tableRow}
                                            key={index}
                                        >
                                            <td>{index + 1}</td>
                                            <td>{e._id}</td>
                                            <td>{e.username}</td>
                                            <td>{e.email}</td>
                                            <td>{e.phone}</td>
                                        </tr>)
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className={styles.addUserContainer}>
                    <h3>Add User</h3>
                    <div className={styles.addUserDiv}>
                        <div className={styles.inputDiv}>
                            <input
                                type="text"
                                placeholder="Enter UserName"
                                value={userData.username}
                                onChange={(e) =>
                                    setUserData((p) => ({ ...p, username: e.target.value }))
                                }
                            />
                            <input
                                type="number"
                                placeholder="Enter Phone"
                                value={userData.phone}
                                onChange={(e) =>
                                    setUserData((p) => ({ ...p, phone: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.inputDiv}>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={userData.password}
                                onChange={(e) =>
                                    setUserData((p) => ({ ...p, password: e.target.value }))
                                }
                            />
                            <button onClick={addUser}>Add User</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default page