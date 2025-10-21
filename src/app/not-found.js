import React from 'react'
import { Spinner } from 'react-bootstrap'
function ErrorPage() {
  return (
    <div style={{width:"100%",height:"90vh",margin:0,padding:0, display:"flex", justifyContent:"center",flexDirection:"column",alignItems:"center", padding:"200px 50px",backgroundColor:"#012167"}}>
        {/* <Spinner style={{fontSize:"30px", height:"100px", width:"100px"}}></Spinner> */}
        <img width={100} height={100} src={'../loading_lab.gif'}/>
        <h2 style={{color:"#02D4F4",textAlign:"center"}}>Game is under construction...</h2>
    </div>
  )
}

export default ErrorPage