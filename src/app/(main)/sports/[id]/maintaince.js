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