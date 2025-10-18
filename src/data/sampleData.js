// Sample data to add to your Firestore database
// Run this script in your Firebase console or create a script to populate your database

const sampleProducts = [
  // Computer Accessories
  {
    name: "Wireless Gaming Mouse",
    price: 45,
    originalPrice: 60,
    description: "High-precision wireless gaming mouse with RGB lighting",
    image: "/mouse.jpg",
    category: "computer-accessories",
    rating: 4.7,
    reviews: 110,
    stock: 45,
    featured: true,
    sales: 160,
    createdAt: new Date()
  },
  {
    name: "Mechanical Gaming Keyboard",
    price: 85,
    originalPrice: 110,
    description: "RGB mechanical keyboard with Cherry MX switches",
    image: "/keyboard.jpg",
    category: "computer-accessories",
    rating: 4.9,
    reviews: 150,
    stock: 25,
    featured: true,
    sales: 120,
    createdAt: new Date()
  },
  {
    name: "USB-C to HDMI Adapter",
    price: 25,
    originalPrice: 35,
    description: "High-speed USB-C to HDMI adapter for 4K displays",
    image: "/adapter.jpg",
    category: "computer-accessories",
    rating: 4.5,
    reviews: 88,
    stock: 50,
    featured: false,
    sales: 150,
    createdAt: new Date()
  },
  {
    name: "USB Charging Cable",
    price: 15,
    originalPrice: 20,
    description: "Durable USB charging cable with fast charging support",
    image: "/cable.jpg",
    category: "computer-accessories",
    rating: 4.3,
    reviews: 75,
    stock: 100,
    featured: false,
    sales: 200,
    createdAt: new Date()
  },
  {
    name: "Laptop Cooling Pad",
    price: 30,
    originalPrice: 40,
    description: "Adjustable laptop cooling pad with dual fans",
    image: "/laptop-cooling-pad.jpg",
    category: "computer-accessories",
    rating: 4.4,
    reviews: 85,
    stock: 35,
    featured: false,
    sales: 90,
    createdAt: new Date()
  },

  // Audio & Sound
  {
    name: "Wireless Bluetooth Earbuds",
    price: 35,
    originalPrice: 50,
    description: "True wireless earbuds with noise cancellation",
    image: "/earbud.jpg",
    category: "audio-sound",
    rating: 4.7,
    reviews: 120,
    stock: 40,
    featured: true,
    sales: 180,
    createdAt: new Date()
  },
  {
    name: "Over-Ear Gaming Headphones",
    price: 75,
    originalPrice: 95,
    description: "Professional gaming headphones with 7.1 surround sound",
    image: "/headphone.jpg",
    category: "audio-sound",
    rating: 4.8,
    reviews: 95,
    stock: 30,
    featured: true,
    sales: 140,
    createdAt: new Date()
  },
  {
    name: "Bluetooth Neckband Headphones",
    price: 40,
    originalPrice: 55,
    description: "Comfortable neckband headphones with long battery life",
    image: "/neckband.jpg",
    category: "audio-sound",
    rating: 4.5,
    reviews: 80,
    stock: 35,
    featured: false,
    sales: 100,
    createdAt: new Date()
  },
  {
    name: "Bluetooth Wireless Speaker",
    price: 60,
    originalPrice: 80,
    description: "Portable wireless speaker with deep bass",
    image: "/speaker.jpg",
    category: "audio-sound",
    rating: 4.6,
    reviews: 105,
    stock: 35,
    featured: true,
    sales: 140,
    createdAt: new Date()
  },
  {
    name: "Wireless Lavalier Microphone",
    price: 70,
    originalPrice: 90,
    description: "Professional wireless microphone for content creation",
    image: "/wireless-microphone.jpg",
    category: "audio-sound",
    rating: 4.9,
    reviews: 85,
    stock: 25,
    featured: false,
    sales: 120,
    createdAt: new Date()
  },

  // Smart Devices
  {
    name: "Fitness Smart Watch",
    price: 150,
    originalPrice: 200,
    description: "Waterproof smart watch with health monitoring",
    image: "/smart-watch.jpg",
    category: "smart-devices",
    rating: 4.9,
    reviews: 200,
    stock: 30,
    featured: true,
    sales: 190,
    createdAt: new Date()
  },
  {
    name: "WiFi Router Modem",
    price: 90,
    originalPrice: 120,
    description: "High-speed dual-band WiFi router with 4 Ethernet ports",
    image: "/wifi-modem.jpg",
    category: "smart-devices",
    rating: 4.8,
    reviews: 125,
    stock: 20,
    featured: true,
    sales: 160,
    createdAt: new Date()
  },
  {
    name: "DC to AC Power Converter",
    price: 45,
    originalPrice: 60,
    description: "12V DC to 110V AC power converter for car use",
    image: "/converter.jpg",
    category: "smart-devices",
    rating: 4.6,
    reviews: 45,
    stock: 25,
    featured: false,
    sales: 80,
    createdAt: new Date()
  },

  // Power & Storage
  {
    name: "20000mAh Power Bank",
    price: 35,
    originalPrice: 45,
    description: "Fast charging power bank with dual USB ports",
    image: "/power-bank.jpg",
    category: "power-storage",
    rating: 4.7,
    reviews: 120,
    stock: 40,
    featured: true,
    sales: 170,
    createdAt: new Date()
  },
  {
    name: "128GB USB Flash Drive",
    price: 25,
    originalPrice: 35,
    description: "High-speed USB 3.0 flash drive with metal casing",
    image: "/pendrive.jpg",
    category: "power-storage",
    rating: 4.6,
    reviews: 95,
    stock: 70,
    featured: false,
    sales: 130,
    createdAt: new Date()
  },
  {
    name: "Portable Mini UPS",
    price: 120,
    originalPrice: 150,
    description: "Compact UPS for router and modem backup power",
    image: "/mini-ups.jpg",
    category: "power-storage",
    rating: 4.6,
    reviews: 55,
    stock: 20,
    featured: false,
    sales: 70,
    createdAt: new Date()
  },

  // Home Appliances
  {
    name: "Electric Rice Cooker",
    price: 80,
    originalPrice: 100,
    description: "Multi-function rice cooker with steamer basket",
    image: "/rice-pot.jpg",
    category: "home-appliances",
    rating: 4.8,
    reviews: 75,
    stock: 25,
    featured: false,
    sales: 85,
    createdAt: new Date()
  },
  {
    name: "LED Table Lamp",
    price: 40,
    originalPrice: 55,
    description: "Adjustable LED table lamp with touch control",
    image: "/table-lamp.jpg",
    category: "home-appliances",
    rating: 4.5,
    reviews: 70,
    stock: 45,
    featured: false,
    sales: 95,
    createdAt: new Date()
  },
  {
    name: "LED Mini Desk Lamp",
    price: 20,
    originalPrice: 30,
    description: "Compact LED desk lamp with adjustable brightness",
    image: "/mini-lamp.jpg",
    category: "home-appliances",
    rating: 4.5,
    reviews: 65,
    stock: 60,
    featured: false,
    sales: 110,
    createdAt: new Date()
  },
  {
    name: "Electric Hair Trimmer",
    price: 55,
    originalPrice: 75,
    description: "Professional cordless hair trimmer with multiple guards",
    image: "/trimmer.jpg",
    category: "home-appliances",
    rating: 4.7,
    reviews: 90,
    stock: 30,
    featured: false,
    sales: 110,
    createdAt: new Date()
  },

  // Gaming
  {
    name: "HAVIT HV-G92 Gamepad",
    price: 120,
    originalPrice: 160,
    description: "Wireless gamepad with RGB lighting and dual vibration",
    image: "/gamepad.jpg",
    category: "gaming",
    rating: 4.5,
    reviews: 88,
    stock: 25,
    featured: true,
    sales: 150,
    createdAt: new Date()
  }
];

const sampleCategories = [
  {
    name: "Computer Accessories",
    slug: "computer-accessories",
    description: "Mouse, keyboards, adapters, cables and computer peripherals",
    image: "/category-computer-accessories.jpg",
    featured: true
  },
  {
    name: "Audio & Sound",
    slug: "audio-sound",
    description: "Headphones, speakers, earbuds and audio equipment",
    image: "/category-audio-sound.jpg",
    featured: true
  },
  {
    name: "Smart Devices",
    slug: "smart-devices",
    description: "Smart watches, WiFi routers and connected devices",
    image: "/category-smart-devices.jpg",
    featured: true
  },
  {
    name: "Power & Storage",
    slug: "power-storage",
    description: "Power banks, USB drives, UPS and storage solutions",
    image: "/category-power-storage.jpg",
    featured: true
  },
  {
    name: "Home Appliances",
    slug: "home-appliances",
    description: "Rice cookers, lamps, trimmers and household items",
    image: "/category-home-appliances.jpg",
    featured: true
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming accessories and equipment",
    image: "/category-gaming.jpg",
    featured: true
  }
];

// Instructions to add this data to Firebase:
/*
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called "products"
4. Add each product as a document in the products collection
5. Create a new collection called "categories"
6. Add each category as a document in the categories collection

Alternatively, you can create a script to add this data programmatically:

import { collection, addDoc } from 'firebase/firestore';
import { db } from './utils/firebase';

// Add products
sampleProducts.forEach(async (product) => {
  try {
    await addDoc(collection(db, 'products'), product);
    console.log('Product added:', product.name);
  } catch (error) {
    console.error('Error adding product:', error);
  }
});

// Add categories
sampleCategories.forEach(async (category) => {
  try {
    await addDoc(collection(db, 'categories'), category);
    console.log('Category added:', category.name);
  } catch (error) {
    console.error('Error adding category:', error);
  }
});
*/

export { sampleProducts, sampleCategories };
