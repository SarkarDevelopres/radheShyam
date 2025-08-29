"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from './sportStyles.module.css'
import { Spinner } from 'react-bootstrap'
function GameComp() {
  const tvRef = useRef(null);
  const spinRef = useRef(null);
  const btnSpan = useRef(null);
  const btnRef = useRef(null);

  const [tvOn, setTvOn] = useState(false);
  const [gameDetails, setGameDetails] = useState({
    home:'',
    away:''
  });
  const openTV = () => {
    if (!tvOn) {
      tvRef.current.style.height = "200px";
      spinRef.current.style.display = "block";
      btnRef.current.style.backgroundColor = "block";
      btnSpan.current.style.marginLeft = "25px";
      setTvOn(true)
    } else {
      setTvOn(false)
      tvRef.current.style.height = "0px";
      spinRef.current.style.display = "none";
      btnSpan.current.style.marginLeft = "0px";
    }
  }
  const fetchData = async (sports) => {
    console.log("SPORTS: ", sports);

    let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/${sports}`);

    let res = await req.json();
    if (res.success) {
      setOddsData([...res.data]);
    }
    else {
      console.log(res);

      router.refresh();
    }
  }

  useEffect(() => {
    let home = localStorage.getItem("home");
    let away = localStorage.getItem("away");
    setGameDetails({
      home:home,
      away:away
    })
  }, [])

  return (
    <div className={styles.mainDiv}>
      <div className={styles.liveTVDiv}>
        <div className={styles.tvHead}>
          <h3>Live TV</h3>
          <button ref={btnRef} onClick={openTV}>
            <span ref={btnSpan} className={styles.buttonSpan}></span>
          </button>
        </div>
        <div ref={tvRef} className={styles.tvDiv}>
          <Spinner ref={spinRef} className={styles.spinnerComp} />
        </div>
      </div>
      <div className={styles.topScoreDiv}></div>
      <div className={styles.oddsDiv}>
        <div className={styles.header}>
          <h3>Match odds</h3>
        </div>
        <div className={styles.oddsComp}>
          <div className={styles.teamDiv}>
            <p>{gameDetails.home}</p>
            <div className={styles.betButtons}>
              <button>2.8</button>
              <button>3.5</button>
            </div>
          </div>
          <div className={styles.teamDiv}>
            <p>{gameDetails.away}</p>
            <div className={styles.betButtons}>
              <button>2.1</button>
              <button>2.7</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameComp