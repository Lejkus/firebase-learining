import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDl_PXaCByfZTlomTzaBfJQ5_ny3kOahS8",
  authDomain: "uploadingfile-bff1f.firebaseapp.com",
  databaseURL: "https://uploadingfile-bff1f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "uploadingfile-bff1f",
  storageBucket: "uploadingfile-bff1f.appspot.com",
  messagingSenderId: "1038887224975",
  appId: "1:1038887224975:web:12450fc63feec6596a52fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);
