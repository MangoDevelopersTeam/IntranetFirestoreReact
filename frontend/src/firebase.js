import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8",
    authDomain: "open-intranet-api-rest.firebaseapp.com",
    projectId: "open-intranet-api-rest",
    storageBucket: "open-intranet-api-rest.appspot.com",
    messagingSenderId: "985836752082",
    appId: "1:985836752082:web:89f6b0ffbabb4fa99ab10b",
    measurementId: "G-K088V48VT2"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export { storage };