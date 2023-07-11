import { addDoc, collection, serverTimestamp } from "firebase/firestore"; 
import { db } from "../../firebase";

const StoreGestData = ({gesture, data}) => {

  const sendDocRef = async() => {
    await addDoc(collection(db, 'gesture-data'), {
      samples: data,
      timestamp: serverTimestamp(),
      gesture: gesture,
    })
  }

  return sendDocRef();
};

// const sendDocRef = async() => {
//   await addDoc(collection(db, 'gesture-data'), {
//     samples: logFile,
//     timestamp: serverTimestamp(),
//     gesture: gesture,
//   })
// }

// return (
//   <>
//     <p>called store gest data</p>
//     <button
//       onClick={sendDocRef}
//     >
//       store data
//     </button>
//   </>
// )
// };
export default StoreGestData;