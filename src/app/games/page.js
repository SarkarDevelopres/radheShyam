// "use client"
// import React, {useState} from 'react'
// import styles from './style.module.css'
// import GameCard from '../../../components/GameCard'
// function Games() {
//   const [gameList, setGameList] = useState([
//       {name:"highlow",image:"highlow.webp"},
//       {name:"7updown",image:"7updown.webp"},
//       {name:"dragontiger",image:"dragontiger.webp"},
//       {name:"amarakbaranthony",image:"aaa.webp"}
//     ])
//   return (
//     <div className={styles.mainDiv}>
//       <h2>Games</h2>
//       <div className={styles.gameList}>
//         {
//           gameList.map((e, i) => {
//             return <GameCard key={i} name={e.name} image={e.image} />
//           })
//         }
//       </div>
//     </div>
//   )
// }

// export default Games

import React from 'react'
import { Spinner } from 'react-bootstrap'
function Games() {
  return (
    <div style={{width:"100%",height:"100%", display:"flex", justifyContent:"center",flexDirection:"column",alignItems:"center", padding:"200px 50px"}}>
        <Spinner style={{fontSize:"30px", height:"100px", width:"100px"}}></Spinner>
        <h2 style={{color:"#02D4F4", textAlign:"center"}}>Games Section is under maintaince for 48 hours...</h2>
    </div>
  )
}

export default Games