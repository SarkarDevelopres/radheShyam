"use client"
import React, {useState} from 'react'
import styles from '../games/style.module.css'
import GameCard from '../../../components/GameCard'
function BoardGames() {
  const [gameList, setGameList] = useState([
      {name:"ludo",image:"ludo-icon.webp"},
      {name:"chess",image:"chess.jpg"},
    //   {name:"dragontiger",image:"dragontiger.webp"},
    //   {name:"amarakbaranthony",image:"aaa.webp"},
    //   {name:"2cardteenpatti",image:"2cardteenpatti.webp"}
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

export default BoardGames