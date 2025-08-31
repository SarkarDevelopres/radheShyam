import Link from 'next/link'
import React from 'react'
import { useRouter } from "next/navigation";
import styles from './styles/adminsidebar.module.css'
function AdminSideBar({ page }) {
    const router = useRouter();
    let home = (<span>General</span>)
    let emp = (<span>Employee</span>)
    let user = (<span>Users</span>)
    let set = (<span>Settings</span>)
    let game = (<span>Games</span>)
    let tv = (<span>Live TV</span>)
    let trans = (<span>Transaction</span>)
    if (page == "home") {
        home = (<span style={{ backgroundColor: '#010f76' }}>General</span>)
    }
    else if (page == "emp") {
        emp = (<span style={{ backgroundColor: '#010f76' }}>Employee</span>)
    }
    else if (page == "usr") {
        user = (<span style={{ backgroundColor: '#010f76' }}>Users</span>)
    }
    else if (page == "game") {
        game = (<span style={{ backgroundColor: '#010f76' }}>Games</span>)
    }
    else if (page == "tv") {
        tv = (<span style={{ backgroundColor: '#010f76' }}>Live TV</span>)
    }
    else if (page == "trans") {
        trans = (<span style={{ backgroundColor: '#010f76' }}>Transaction</span>)
    }
    else if (page == "set") {
        set = (<span style={{ backgroundColor: '#010f76' }}>Settings</span>)
    }


    const logOut = () => {
        let confirmLogOut = confirm("Sure Want to Log-Out ?");

        if (confirmLogOut) {
            localStorage.clear();
            router.replace("/");
        }
    }

    return (
        <div className={styles.sideBarMainDiv}>
            <div className={styles.linksBar}>
                <Link href={'/admin/'}>{home}</Link>
                <Link href={'/admin/employee'}>{emp}</Link>
                <Link href={'/admin/user'}>{user}</Link>
                <Link href={'/admin/games'}>{game}</Link>
                <Link href={'/admin/tv'}>{tv}</Link>
                <Link href={'/admin/transaction'}>{trans}</Link>
                <Link href={'/admin/setting'}>{set}</Link>
                <button onClick={logOut}>Log Out</button>
            </div>
        </div>
    )
}

export default AdminSideBar