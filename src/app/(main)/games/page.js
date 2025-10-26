"use client"
import React, { useState } from 'react'
import styles from './style.module.css'
import GameCard from '@components/GameCard'
function Games() {
  const [gameList, setGameList] = useState([
    { name: "highlow", image: "highlow.webp" },
    { name: "7updown", image: "7updown.webp" },
    { name: "dragontiger", image: "dragontiger.webp" },
    { name: "amarakbaranthony", image: "aaa.png" },
    { name: "andarbaharlite", image: "andarbaharlite.png" },
    { name: "andarbahar", image: "andarbahar.webp", isNew: true },
    { name: "matka", image: "matka.jpg", isNew: true },
    { name: "roulette", image: "roulette.jpg", isNew: true },
    { name: "war", image: "war.jpg", isNew: true },
    { name: "teenpattit20", image: "teenpatti20.jpg", isNew: true },
    { name: "twocardteenpatti", image: "twocardteenpatti.jpg", isNew: true },
    { name: "racetwo17", image: "race17.jpg", isNew: true },
    { name: "aviator", image: "aviator-icon.png", isNew: true },
  ])
  return (
    <div className={styles.mainDiv}>
      <h2>Games</h2>
      <div className={styles.gameList}>
        {
          gameList.map((e, i) => {
            return <GameCard key={i} name={e.name} image={e.image} isNew={e.isNew} />
          })
        }
      </div>
    </div>
  )
}

export default Games