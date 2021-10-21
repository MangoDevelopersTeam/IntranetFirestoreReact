// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8",
    authDomain: "open-intranet-api-rest.firebaseapp.com",
    projectId: "open-intranet-api-rest",
    storageBucket: "open-intranet-api-rest.appspot.com",
    messagingSenderId: "985836752082",
    appId: "1:985836752082:web:89f6b0ffbabb4fa99ab10b",
    measurementId: "G-K088V48VT2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage }