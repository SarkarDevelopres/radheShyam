"use client"
import React, { useState, useRef, useEffect } from 'react'
import styles from './sportStyles.module.css'
import { Spinner } from 'react-bootstrap'
import Loading from '@components/Loading'
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import CricketLiveComp from '@components/CricketLiveComp'
import TennisLiveComp from '@components/TennisLiveComp'
import OtherComp from '@components/OtherComp'

function GameComp() {
  const [isLoading, setIsLoading] = useState(true);
  const [sport, setSport] = useState("");
  useEffect(() => {
    if (typeof window != "undefined") {
      setIsLoading(false);
      let sportName = localStorage.getItem('sport');
      setSport(sportName.toLowerCase());
    }
  }, [])

  return (
    <div style={{display:"flex"}}>
      {isLoading && <Loading />}
      {sport == "cricket" ? <CricketLiveComp/> : sport == "tennis" ? <TennisLiveComp/> : <OtherComp/>}
    </div>
  )
}

export default GameComp