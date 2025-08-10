import React from 'react'
import { useRouter } from 'next/navigation'
import styles from './styles/gameCard.module.css'

function GameCard({ image, name }) {
    const router = useRouter()
    return (
        <div
            className={styles.gameDiv}
            style={{ backgroundImage: `url(${image})` }} onClick={()=>router.push(`/games/${name}`)}>

        </div>
    )
}

export default GameCard