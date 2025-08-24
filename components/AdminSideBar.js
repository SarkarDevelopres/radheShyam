import Link from 'next/link'
import React from 'react'
import styles from './styles/adminsidebar.module.css'
function AdminSideBar({page}) {
    let home = (<span>General</span>)
    let emp = (<span>Employee</span>)
    let user = (<span>Users</span>)
    let set = (<span>Settings</span>)
    let game = (<span>Games</span>)
    let trans = (<span>Transaction</span>)
    if (page=="home") {
        home = (<span style={{ backgroundColor: '#010f76' }}>General</span>)
    }
    else if(page=="emp"){
        emp = (<span style={{ backgroundColor: '#010f76' }}>Employee</span>)
    }
    else if(page=="usr"){
        user = (<span style={{ backgroundColor: '#010f76' }}>Users</span>)
    }
    else if(page=="game"){
        game = (<span style={{ backgroundColor: '#010f76' }}>Games</span>)
    }
    else if(page=="trans"){
        trans = (<span style={{ backgroundColor: '#010f76' }}>Transaction</span>)
    }
    else if(page=="set"){
        set = (<span style={{ backgroundColor: '#010f76' }}>Settings</span>)
    }
    return (
        <div className={styles.sideBarMainDiv}>
            <div className={styles.linksBar}>
                <Link href={'/admin/'}>{home}</Link>
                <Link href={'/admin/employee'}>{emp}</Link>
                <Link href={'/admin/user'}>{user}</Link>
                <Link href={'/admin/games'}>{game}</Link>
                <Link href={'/admin/transaction'}>{trans}</Link>
                <Link href={'/admin/setting'}>{set}</Link>
            </div>
        </div>
    )
}

export default AdminSideBar