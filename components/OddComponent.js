import React from 'react'
import styles from "./styles/odd.module.css"
function OddComponent() {
  return (
    <div className={styles.oddMainComp}>
        <div className={styles.OddDetails}>
            <span className={styles.liveIndicator}/>
            <div className={styles.teamMatchDetails}>
                <p>Zimbabwe vs New Zealand</p>
                <span>02 Aug 10:30 | Test Match</span>
            </div>
        </div>
        <div className={styles.OddData}>
            <div className={styles.oddsPair}>
                <button>120</button>
                <button>180</button>
            </div>
            <div className={styles.oddsPair}>
                <button>120</button>
                <button>180</button>
            </div>
            <div className={styles.oddsPair}>
                <button>120</button>
                <button>180</button>
            </div>
        </div>
    </div>
  )
}

export default OddComponent