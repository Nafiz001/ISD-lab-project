// Script to clear carousel slides for testing
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaI8Q5a6bQx1xFUPFlNMRh5J5fMT9e1Ag",
  authDomain: "shopcircuit-ed061.firebaseapp.com", 
  projectId: "shopcircuit-ed061",
  storageBucket: "shopcircuit-ed061.appspot.com",
  messagingSenderId: "468732481994",
  appId: "1:468732481994:web:b9e5b0f1c2a3d4e5f6g7h8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCarouselSlides() {
  try {
    console.log('Starting to clear carousel slides...');
    
    const querySnapshot = await getDocs(collection(db, 'carouselSlides'));
    
    for (const slideDoc of querySnapshot.docs) {
      await deleteDoc(doc(db, 'carouselSlides', slideDoc.id));
      console.log(`Deleted slide: ${slideDoc.data().title}`);
    }
    
    console.log('All carousel slides cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing carousel slides:', error);
    process.exit(1);
  }
}

clearCarouselSlides();
