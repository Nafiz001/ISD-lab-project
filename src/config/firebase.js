// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUOfQJkRLCGoJSsesKfq1JTz6RprWypJw",
  authDomain: "shopcircuit-ed061.firebaseapp.com",
  projectId: "shopcircuit-ed061",
  storageBucket: "shopcircuit-ed061.firebasestorage.app",
  messagingSenderId: "593542782554",
  appId: "1:593542782554:web:8045cd1689338675c34263"
};

// Admin email addresses (for backward compatibility)
export const ADMIN_EMAILS = [
  'admin@shopcircuit.com',
  'nafiz@shopcircuit.com',
  // Add more admin emails here
];

// Admin credentials with email and password validation
export const ADMIN_CREDENTIALS = [
  { email: 'admin@shopcircuit.com', password: 'admin123' },
  { email: 'nafiz@shopcircuit.com', password: 'nafiz123' },
  // Add more admin credentials here
];

export default firebaseConfig;
