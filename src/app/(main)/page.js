"use client"
import { useRef, useEffect, useState } from 'react';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import InfiniteSlider from "@components/InfiniteSlide";
import GameCard from '@components/GameCard';


export function SportsSection({ sportName, image, matchList }) {
  const router = useRouter()
  return (
    <div className={styles.sportsSection}>
      <div className={styles.sportsSectionHeader}>
        <h2>{sportName}</h2>
        <img src={image} />
      </div>
      <div className={styles.sportsSectionBody}>
        {sportName == "Cricket" || sportName == "Tennis" ?
          matchList.map((e, i) => {
            return <div key={i}>
              <p>{`${e.teamHome.name} vs ${e.teamAway.name}`}</p>
              <button onClick={() => router.push(`/sports`)}>Bet Now</button>
            </div>
          })
          : <p>By October you will have all 5 sports, thanks for you patience!</p>
        }
      </div>
    </div>
  )

}

export default function Home() {
  const router = useRouter();
  const cardListRef = useRef(null);
  const [gameList, setGameList] = useState([
    { name: "highlow", image: "highlow.webp" },
    { name: "7updown", image: "7updown.webp" },
    { name: "dragontiger", image: "dragontiger.webp" },
    { name: "amarakbaranthony", image: "aaa.png" },
    // { name: "andarbahar", image: "andarbahar.webp", isNew: true },
    // { name: "aviator", image: "aviator-icon.png", isNew: true },
    // { name: "matka", image: "matka.jpg", isNew: true },
    // { name: "teenpattit20", image: "teenpatti20.jpg", isNew: true },
    // { name: "roulette", image: "roulette.jpg", isNew: true },
    // { name: "twocardteenpatti", image: "twocardteenpatti.jpg", isNew: true },
    // { name: "racetwo17", image: "race17.jpg", isNew: true },
    // { name: "war", image: "war.jpg", isNew: true },
  ])
  const [oddsData, setOddsData] = useState({
    cricket: [],
    soccer: [],
    tennis: [],
    basketball: [],
    baseball: [],
  });

  const fetchData = async (sports) => {
    console.log("SPORTS: ", sports);

    let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/${sports}`);

    let res = await req.json();
    if (res.success) {
      if (sports == "cricket") {
        setOddsData((p) => ({ ...p, cricket: [...res.data] }));

      }
      else if (sports == "soccer") {
        setOddsData((p) => ({ ...p, soccer: [...res.data] }));
      }
      else if (sports == "tennis") {
        setOddsData((p) => ({ ...p, tennis: [...res.data] }));
      }
      else if (sports == "basketball") {
        setOddsData((p) => ({ ...p, basketball: [...res.data] }));
      }
      else if (sports == "baseball") {
        setOddsData((p) => ({ ...p, baseball: [...res.data] }));
      }
    }
    else {
      console.log(res);

      router.refresh();
    }


  }

  useEffect(() => {
    fetchData("cricket");
    fetchData("tennis");
  }, [])

  return (
    <div className={styles.mainDiv}>
      <section className={styles.banenrSection}>
        <InfiniteSlider />
      </section>
      <section className={styles.cardsSection}>
        <div className={styles.cardList} ref={cardListRef}>
          <div className={styles.card} style={{ backgroundImage: `url(/casino-card.jpg)` }}
            onClick={() => router.push('/games')} ></div>
          <div className={styles.card} style={{ backgroundImage: `url(/sports-card.jpg)` }}
            onClick={() => router.push('/sports')} ></div>
          <div className={styles.card} style={{ backgroundImage: `url(/board-card.png)` }}
            onClick={() => router.push('/board')}
          ></div>

        </div>
      </section>
      <section className={styles.gamesection}>
        <h2>Top Games</h2>
        <div className={styles.gameList}>
          {
            gameList.map((e, i) => {
              return <GameCard key={i} name={e.name} image={e.image} isNew={e.isNew} />
            })
          }
          <button onClick={()=>router.push('/games')}>View More</button>
        </div>
      </section>
      <SportsSection sportName={"Cricket"} image={"/cricketicon.png"} matchList={oddsData.cricket} />
      <SportsSection sportName={"Football"} image={"/fotballicon.png"} matchList={oddsData.soccer} />
      <SportsSection sportName={"Tennis"} image={"/tennisicon.png"} matchList={oddsData.tennis} />
      <SportsSection sportName={"Basketball"} image={"/basketballicon.png"} matchList={oddsData.basketball} />
      <SportsSection sportName={"Baseball"} image={"/baseballicon.png"} matchList={oddsData.baseball} />
    </div>
  );
}
