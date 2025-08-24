"use client"
import React, {useState} from 'react'
import styles from './style.module.css'
import GameCard from '../../../components/GameCard'
function Games() {
  const [gameList, setGameList] = useState([
      {name:"highlow",image:"highlow.webp"},
      {name:"7updown",image:"7updown.webp"},
      {name:"dragontiger",image:"dragontiger.webp"},
      {name:"amarakbaranthony",image:"aaa.webp"},
      {name:"2cardteenpatti",image:"2cardteenpatti.webp"}
    ])
  return (
    <div className={styles.mainDiv}>
      <h2>Games</h2>
      <div className={styles.gameList}>
        {
          gameList.map((e, i) => {
            return <GameCard key={i} name={e.name} image={e.image} />
          })
        }
      </div>
    </div>
  )
}

export default Games