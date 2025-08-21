// export default async function () {
//     let token = localStorage.getItem("usertoken");
//     let data = {
//         message: "Log In to Access!",
//         success: false,
//     }
//     try {
//         if (!token) {
//             return data;
//         }

//         let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/place`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', ,
//             body: JSON.stringify({ /* payload */ })
//         });


//     } catch (error) {

//     }
// } 