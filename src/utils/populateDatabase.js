// Script to populate database with sample products
// Run this in your browser console after navigating to your app
// Make sure you're logged in as an admin

import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const sampleProducts = [
  {
    name: "Wireless Gaming Mouse",
    price: 45,
    originalPrice: 60,
    description: "High-precision wireless gaming mouse with RGB lighting and programmable buttons",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    category: "computer-accessories",
    rating: 4.7,
    reviews: 110,
    stock: 45,
    featured: true,
    sales: 160,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mechanical Gaming Keyboard",
    price: 85,
    originalPrice: 110,
    description: "RGB mechanical keyboard with Cherry MX switches and customizable lighting",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
    category: "computer-accessories",
    rating: 4.9,
    reviews: 150,
    stock: 25,
    featured: true,
    sales: 120,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Wireless Bluetooth Earbuds",
    price: 35,
    originalPrice: 50,
    description: "True wireless earbuds with active noise cancellation and long battery life",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500",
    category: "audio-sound",
    rating: 4.7,
    reviews: 120,
    stock: 40,
    featured: true,
    sales: 180,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Gaming Headphones",
    price: 75,
    originalPrice: 95,
    description: "Professional gaming headphones with 7.1 surround sound and crystal clear microphone",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
    category: "audio-sound",
    rating: 4.8,
    reviews: 95,
    stock: 30,
    featured: true,
    sales: 140,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Fitness Smart Watch",
    price: 150,
    originalPrice: 200,
    description: "Waterproof fitness smartwatch with heart rate monitoring and GPS tracking",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "smart-devices",
    rating: 4.9,
    reviews: 200,
    stock: 30,
    featured: true,
    sales: 190,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "20000mAh Power Bank",
    price: 35,
    originalPrice: 45,
    description: "Fast charging power bank with dual USB ports and LED display",
    image: "https://images.unsplash.com/photo-1609592888419-b4fef96e8383?w=500",
    category: "power-storage",
    rating: 4.7,
    reviews: 120,
    stock: 40,
    featured: true,
    sales: 170,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "LED Desk Lamp",
    price: 40,
    originalPrice: 55,
    description: "Adjustable LED desk lamp with touch control and multiple brightness levels",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    category: "home-appliances",
    rating: 4.5,
    reviews: 70,
    stock: 45,
    featured: false,
    sales: 95,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Wireless Game Controller",
    price: 55,
    originalPrice: 70,
    description: "Bluetooth wireless game controller with haptic feedback and long battery life",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
    category: "gaming",
    rating: 4.6,
    reviews: 85,
    stock: 35,
    featured: true,
    sales: 110,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to add products to Firestore
export const populateProducts = async () => {
  try {
    console.log('Starting to populate products...');
    
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('Successfully populated all products!');
    alert('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
    alert('Error populating database: ' + error.message);
  }
};

// Run this function to populate the database
// populateProducts();
