"use client"
import { useRef, useEffect, useState } from 'react';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import InfiniteSlider from "../../components/InfiniteSlide";
import GameCard from '../../components/GameCard';


export function SportsSection({sportName, image}){
  const [matchList, setMatchList] = useState(["20 May 09:00 | Bangladesh Emerging Team v South Africa Emerging Players Live Now","21 May 09:00 | Bangladesh A v New Zealand A | Live Now","01 Mar 16:30 | Indian Premier League"])
  return(
    <div className={styles.sportsSection}>
      <div className={styles.sportsSectionHeader}>
        <h2>{sportName}</h2>
        <img src={image}/>
      </div>
      <div className={styles.sportsSectionBody}>
        {
          matchList.map((e,i)=>{
            return <div>
              <p>{e}</p>
              <button>Bet Now</button>
            </div>
          })
        }
        </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter();
  const cardListRef = useRef(null);
  const [gameList, setGameList] = useState([
    {name:"highlow",image:"highlow.webp"},
    {name:"7updown",image:"7updown.webp"},
    {name:"dragontiger",image:"dragontiger.webp"},
    {name:"andarbahar",image:"andarbahar.webp"},
    {name:"2cardteenpatti",image:"2cardteenpatti.webp"}
  ])

  return (
    <div className={styles.mainDiv}>
      <section className={styles.banenrSection}>
        <InfiniteSlider />
      </section>
      <section className={styles.cardsSection}>
        <div className={styles.cardList} ref={cardListRef}>
          <div className={styles.card} style={{ backgroundImage: `url(/aviator-card.jpg)` }} 
          onClick={()=>router.push('/games/flight')}
          ></div>
          <div className={styles.card} style={{ backgroundImage: `url(/casino-card.jpg)` }} 
          onClick={()=>router.push('/games')} ></div>
          <div className={styles.card} style={{ backgroundImage: `url(/sports-card.jpg)` }}
          onClick={()=>router.push('/sports')} ></div>
          
        </div>
      </section>
      <section className={styles.gamesection}>
        <h2>Top Games</h2>
        <div className={styles.gameList}>
          {
            gameList.map((e,i)=>{
              return <GameCard key={i} name={e.name} image={e.image} />
            })
          }
        </div>
      </section>
      <SportsSection sportName={"Cricket"} image={"/cricketicon.png"}/>
      <SportsSection sportName={"Football"} image={"/fotballicon.png"}/>
      <SportsSection sportName={"Tennis"} image={"/tennisicon.png"}/>
    </div>
  );
}
