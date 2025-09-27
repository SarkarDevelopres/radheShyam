import React from 'react'
import { Spinner } from 'react-bootstrap'
function page() {
  return (
    <div style={{width:"100%",height:"90vh", display:"flex", justifyContent:"center",flexDirection:"column",alignItems:"center", padding:"200px 50px"}}>
        {/* <Spinner style={{fontSize:"30px", height:"100px", width:"100px"}}></Spinner> */}
        <img width={100} height={100} src={'../loading_lab.gif'}/>
        <h2 style={{color:"#02D4F4"}}>Game is under construction...</h2>
    </div>
  )
}

export default page