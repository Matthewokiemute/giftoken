// "use client"

// import { useEffect } from "react";
// import WeaveDB from "weavedb-sdk"

// const setupWeaveDB = async () => {
//     try {
//       const _db = new WeaveDB({
//         contractTxId: process.env.contractTxId,
//       });
//       await _db.init();
//       setDb(_db);
//       setInitDb(true);
//     } catch (e) {
//       console.error("setupWeaveDB", e);
//     }
//   };

//   useEffect(() => {
//     setupWeaveDB();
//   }, []);

// export default setupWeaveDB;