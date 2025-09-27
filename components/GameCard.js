import React from 'react'
import { useRouter } from 'next/navigation'
import styles from './styles/gameCard.module.css'

function GameCard({ image, name, isNew=false }) {
    const router = useRouter()
    return (
        <div
            className={styles.gameDiv}
            style={{ backgroundImage: `url(${image})` }} onClick={()=>router.push(`/games/${name}`)}>
                {isNew&&<div style={{backgroundColor:"rgb(200,10,0)", width:"80%", borderRadius:"5px", padding:"2px", textAlign:"center", color:"rgba(255, 255, 0, 1)"}}>Work Ongoing</div>}
        </div>
    )
}

export default GameCard