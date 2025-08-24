import React from 'react'
import styles from './styles/modal.module.css'
import Spinner from 'react-bootstrap/Spinner';
function Loading() {
  return (
    <div className={styles.mainDiv} style={{backgroundColor:'rgba(70,70,70,0.7)',zIndex:'20',display:'flex', alignItems:'center', justifyContent:'center'}}>
        {/* <img src='../loading-gif.gif' className={styles.loadingComp} /> */}
        <Spinner animation="border" variant="primary" style={{width: '300px',height: '300px',fontSize: '5rem'}}/>
    </div>
  )
}

export default Loading