import React from 'react'
import { Spinner } from 'react-bootstrap'

function TennisLiveComp() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 10px",
                height:"90vh",
                width: "100%",
                borderRadius: "10px",
                backgroundColor: "#1a2c53ff",
            }}
        >
            <Spinner style={{ marginBottom: "20px" }} />
            <h4 style={{textAlign:"center"}}>{`Tennis Live-Score is being tested.`}</h4>
            <p style={{ fontSize: "10px" }}>
                We appricicate your patience!
            </p>
        </div>
    )
}

export default TennisLiveComp