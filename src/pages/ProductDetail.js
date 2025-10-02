import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { FiHeart, FiStar, FiMinus, FiPlus, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', id));
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        setProduct(productData);
        setSelectedImage(productData.image);
      } else {
        toast.error('Product not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity
    };
    addToCart(cartItem);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const allImages = [product.image, ...(product.secondaryImages || [])].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-4 lg:py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 lg:mb-6 text-sm text-gray-600">
        <span 
          onClick={() => navigate('/')}
          className="cursor-pointer hover:text-black"
        >
          Home
        </span>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category?.replace('-', ' ')}</span>
        <span className="mx-2">/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="w-full h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-white border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={selectedImage || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex space-x-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === image 
                      ? 'border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={`${
                      i < (product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews || 0} reviews)</span>
              <span className="text-green-600">• In Stock</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl lg:text-3xl font-bold text-red-500">৳{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg lg:text-xl text-gray-400 line-through">
                  ৳{product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm lg:text-base">{product.description}</p>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity:</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={decreaseQuantity}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-3 py-2 border-l border-r border-gray-300 min-w-[50px] text-center text-sm">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <span className="text-xs lg:text-sm text-gray-600">
                Only {product.stock} items left in stock
              </span>
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex space-x-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-red-500 text-white py-2.5 lg:py-3 px-4 lg:px-6 rounded hover:bg-red-600 transition-colors font-medium text-sm lg:text-base"
            >
              Add to Cart
            </button>
            <button className="p-2.5 lg:p-3 border border-gray-300 rounded hover:bg-gray-50">
              <FiHeart size={18} />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border-t pt-4 lg:pt-6 space-y-3 lg:space-y-4">
            <div className="flex items-center space-x-3">
              <FiTruck className="text-gray-600" size={18} />
              <div>
                <p className="font-medium text-sm lg:text-base">Free Delivery</p>
                <p className="text-xs lg:text-sm text-gray-600">Enter your postal code for Delivery Availability</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-gray-600 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-sm lg:text-base">Return Delivery</p>
                <p className="text-xs lg:text-sm text-gray-600">Free 30 Days Delivery Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
