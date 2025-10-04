// Script to populate initial carousel slides
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

const carouselSlides = [
  {
    title: "Gaming Accessories",
    subtitle: "Level up your game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    link: "/category/gaming",
    order: 1,
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Mobile Phones",
    subtitle: "Latest smartphones with 5G",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    link: "/category/mobile-phone",
    order: 2,
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Smart Watches",
    subtitle: "Track your fitness goals",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    link: "/category/smartwatch",
    order: 3,
    isActive: true,
    createdAt: new Date()
  }
];

async function populateCarouselSlides() {
  try {
    console.log('Starting to populate carousel slides...');
    
    for (const slide of carouselSlides) {
      const docRef = await addDoc(collection(db, 'carouselSlides'), slide);
      console.log(`Added slide: ${slide.title} with ID: ${docRef.id}`);
    }
    
    console.log('Carousel slides populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating carousel slides:', error);
    process.exit(1);
  }
}

populateCarouselSlides();
