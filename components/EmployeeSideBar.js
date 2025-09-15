import Link from 'next/link'
import React from 'react'
import { useRouter } from "next/navigation";
import styles from './styles/adminsidebar.module.css'
function EmployeeSideBar({ page }) {
    const router = useRouter();
    let home = (<span>General</span>)
    let user = (<span>Users</span>)
    let game = (<span>Games</span>)
    let trans = (<span>Transaction</span>)
    if (page == "home") {
        home = (<span style={{ backgroundColor: '#010f76' }}>General</span>)
    }
    else if (page == "usr") {
        user = (<span style={{ backgroundColor: '#010f76' }}>Users</span>)
    }
    else if (page == "game") {
        game = (<span style={{ backgroundColor: '#010f76' }}>Games</span>)
    }
    else if (page == "trans") {
        trans = (<span style={{ backgroundColor: '#010f76' }}>Transaction</span>)
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
                <Link href={'/employee/'}>{home}</Link>
                <Link href={'/employee/user'}>{user}</Link>
                <Link href={'/employee/games'}>{game}</Link>
                <Link href={'/employee/transaction'}>{trans}</Link>
                <button onClick={logOut}>Log Out</button>
            </div>
        </div>
    )
}

export default EmployeeSideBar