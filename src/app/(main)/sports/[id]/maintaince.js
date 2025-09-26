import React from 'react'
import { Spinner } from 'react-bootstrap'
function page() {
  return (
    <div style={{width:"100%",height:"100%", display:"flex", justifyContent:"center",flexDirection:"column",alignItems:"center", padding:"200px 50px"}}>
        <Spinner style={{fontSize:"30px", height:"100px", width:"100px"}}></Spinner>
        <h2 style={{color:"#02D4F4"}}>Sports Section is under maintaince...</h2>
    </div>
  )
}

export default page

// {
// "status": "ok",
// "response": {
// "91934": {
// "live_odds": {
// "matchodds": {
// "teama": {
// "back": "3.3",
// "lay": "5.4",
// "back_volume": "4257.57",
// "lay_volume": "4685.46"
// },
// "teamb": {
// "back": "1.23",
// "lay": "1.43",
// "back_volume": "20566.09",
// "lay_volume": "9825.16"
// }
// },
// "tiedmatch": {
// "teama": {
// "back": "1.04",
// "lay": "1.05",
// "back_volume": "1357.79",
// "lay_volume": "980"
// },
// "teamb": {
// "back": "21",
// "lay": "26",
// "back_volume": "49",
// "lay_volume": "54.31"
// }
// },
// "bookmaker": {
// "teama": {
// "back": "0.00",
// "lay": "1.01",
// "back_volume": "0.00",
// "lay_volume": "1000000.00"
// },
// "teamb": {
// "back": "0.00",
// "lay": "0.00",
// "back_volume": "0.00",
// "lay_volume": "0.00"
// }
// }
// },
// "session_odds": [
// {
// "question_id": 11698631,
// "team_batting": "21",
// "title": "Super over run bhav SL",
// "back_condition": "8",
// "back": "200",
// "lay_condition": "8",
// "lay": "400",
// "status": "Ball Running",
// "category": ""
// },
// {
// "question_id": 11698630,
// "team_batting": "21",
// "title": "Super over run SL",
// "back_condition": "9",
// "back": "100",
// "lay_condition": "8",
// "lay": "100",
// "status": "Ball Running",
// "category": ""
// }
// ]
// },
// "total_items": 1,
// "total_pages": 1
// },
// "etag": "36e026b3d02823920a99fbd220a48895",
// "modified": "2025-09-26 18:53:55",
// "datetime": "2025-09-26 18:53:55",
// "api_version": "1.0"
// }