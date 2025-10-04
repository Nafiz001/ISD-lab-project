import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';

// Import category icons
import mobileIcon from '../assets/category/mobile-phone.png';
import computerIcon from '../assets/category/computer.png';
import smartwatchIcon from '../assets/category/smartwatch.png';
import cameraIcon from '../assets/category/camera.png';
import headphonesIcon from '../assets/category/headphones.png';
import gamingIcon from '../assets/category/gaming.png';

// Import service icons
import fastDeliveryIcon from '../assets/contact/fast-delivery.png';
import customerServiceIcon from '../assets/contact/customer_sevice.png';
import moneyBackIcon from '../assets/contact/check-mark.png';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const { products: flashSales, loading: flashLoading } = useProducts({ limit: 8, orderBy: 'createdAt' });
  const { products: bestSelling, loading: bestLoading } = useProducts({ limit: 4, orderBy: 'sales' });

  // Fetch carousel slides from Firestore
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setSlidesLoading(true);
        const slidesQuery = query(
          collection(db, 'carouselSlides'),
          where('isActive', '==', true)
        );
        const slidesSnapshot = await getDocs(slidesQuery);
        const slidesData = slidesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by order and set slides
        const sortedSlides = slidesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(sortedSlides);
        
        // If no slides exist, use default slides
        if (sortedSlides.length === 0) {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
        setSlides(defaultSlides);
      } finally {
        setSlidesLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Default slides as fallback
  const defaultSlides = [
    {
      id: 1,
      title: "iPhone 14 Series",
      subtitle: "Up to 10% off Voucher",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      link: "/products"
    },
    {
      id: 2,
      title: "Summer Collection",
      subtitle: "50% off on selected items",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      link: "/products"
    },
    {
      id: 3,
      title: "Gaming Accessories",
      subtitle: "Level up your game",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      link: "/category/gaming"
    }
  ];

  // Categories data
  const categories = [
    { name: "Computer Accessories", icon: computerIcon, link: "/category/computer-accessories" },
    { name: "Audio & Sound", icon: headphonesIcon, link: "/category/audio-sound" },
    { name: "Smart Devices", icon: smartwatchIcon, link: "/category/smart-devices" },
    { name: "Power & Storage", icon: computerIcon, link: "/category/power-storage" },
    { name: "Home Appliances", icon: cameraIcon, link: "/category/home-appliances" },
    { name: "Gaming", icon: gamingIcon, link: "/category/gaming" }
  ];

  // Auto slide effect
  useEffect(() => {
    if (slides.length > 0 && !slidesLoading) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length, slidesLoading]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Browse By Category</h3>
              <ul className="space-y-3">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link
                      to={category.link}
                      className="flex items-center space-x-3 text-gray-700 hover:text-red-500 transition-colors"
                    >
                      <img 
                        src={category.icon} 
                        alt={category.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hero Slider */}
          <div className="lg:col-span-3">
            <div className="relative rounded-lg overflow-hidden h-80">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Full width background image */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-fill"
                  />
                  
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                  {/* Text content overlay */}
                  <div className="absolute inset-0 flex items-center justify-start px-8 md:px-12 text-white">
                    <div className="space-y-4 max-w-md">
                      <p className="text-sm flex items-center space-x-2">
                        <span>{slide.title}</span>
                      </p>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        {slide.subtitle}
                      </h2>
                      <Link
                        to={slide.link}
                        className="inline-flex items-center space-x-2 text-white hover:text-gray-300 transition-colors border-b border-white pb-1"
                      >
                        <span>Shop Now</span>
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
              >
                <FiArrowLeft className="text-white" size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
              >
                <FiArrowRight className="text-white" size={20} />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-red-500' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <span className="text-red-500 font-semibold">Today's</span>
            </div>
            <h2 className="text-3xl font-bold">Flash Sales</h2>
          </div>
          <Link
            to="/flash-sales"
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
          >
            View All Products
          </Link>
        </div>

        {flashLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {flashSales.map((product) => (
              <ProductCard key={product.id} product={product} showDiscount={true} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-5 h-10 bg-red-500 rounded"></div>
            <span className="text-red-500 font-semibold">Categories</span>
          </div>
          <h2 className="text-3xl font-bold">Browse By Category</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link}
              className="group p-6 border-2 border-gray-200 rounded-lg text-center hover:border-red-500 hover:bg-red-500 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <img 
                  src={category.icon} 
                  alt={category.name}
                  className="w-14 h-14 object-contain group-hover:filter group-hover:brightness-0 group-hover:invert transition-all duration-300"
                />
              </div>
              <span className="font-medium group-hover:text-white transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <span className="text-red-500 font-semibold">This Month</span>
            </div>
            <h2 className="text-3xl font-bold">Best Selling Products</h2>
          </div>
          <Link
            to="/best-selling"
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
          >
            View All
          </Link>
        </div>

        {bestLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {bestSelling.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Explore Our Products Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <span className="text-red-500 font-semibold">Our Products</span>
            </div>
            <h2 className="text-3xl font-bold">Explore Our Products</h2>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <FiArrowLeft size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <FiArrowRight size={20} />
            </button>
          </div>
        </div>

        {flashLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 items-stretch">
              {flashSales.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} showDiscount={true} />
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/products"
                className="bg-red-500 text-white px-8 py-3 rounded hover:bg-red-600 transition-colors inline-block"
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <img 
                src={fastDeliveryIcon} 
                alt="Fast Delivery"
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">FREE AND FAST DELIVERY</h3>
            <p className="text-gray-600">Free delivery for all orders over ৳140</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <img 
                src={customerServiceIcon} 
                alt="Customer Service"
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">24/7 CUSTOMER SERVICE</h3>
            <p className="text-gray-600">Friendly 24/7 customer support</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <img 
                src={moneyBackIcon} 
                alt="Money Back Guarantee"
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">MONEY BACK GUARANTEE</h3>
            <p className="text-gray-600">We return money within 30 days</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
