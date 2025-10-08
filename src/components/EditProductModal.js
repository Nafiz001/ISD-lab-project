import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import { FiX, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    originalPrice: product.originalPrice || '',
    category: product.category || '',
    stock: product.stock || '',
    featured: product.featured || false,
    rating: product.rating || 4.5,
    reviews: product.reviews || 0
  });
  const [mainImage, setMainImage] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState(product.secondaryImages || []);
  const [loading, setLoading] = useState(false);

  const categories = [
    'computer-accessories',
    'audio-sound',
    'smart-devices',
    'power-storage',
    'home-appliances',
    'gaming'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleSecondaryImagesChange = (e) => {
    if (e.target.files) {
      setSecondaryImages(Array.from(e.target.files));
    }
  };

  const removeExistingSecondaryImage = (imageUrl) => {
    setExistingSecondaryImages(prev => prev.filter(img => img !== imageUrl));
  };

  const uploadImage = async (imageFile, path) => {
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, imageFile);
    return getDownloadURL(imageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = product.image;
      let allSecondaryImages = [...existingSecondaryImages];

      // Upload new main image if selected
      if (mainImage) {
        mainImageUrl = await uploadImage(
          mainImage, 
          `products/${Date.now()}_${mainImage.name}`
        );
      }

      // Upload new secondary images
      if (secondaryImages.length > 0) {
        const uploadPromises = secondaryImages.map((image, index) =>
          uploadImage(image, `products/secondary/${Date.now()}_${index}_${image.name}`)
        );
        const newSecondaryUrls = await Promise.all(uploadPromises);
        allSecondaryImages = [...allSecondaryImages, ...newSecondaryUrls];
      }

      // Update product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        image: mainImageUrl,
        secondaryImages: allSecondaryImages,
        updatedAt: new Date()
      };

      // Update in Firestore
      await updateDoc(doc(db, 'products', product.id), productData);
      
      onProductUpdated();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit Product</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Tk) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (Tk)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Category and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Featured Product */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Featured Product
              </label>
            </div>

            {/* Current Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Main Image
              </label>
              {product.image && (
                <img 
                  src={product.image} 
                  alt="Current main" 
                  className="w-20 h-20 object-cover rounded border mb-2"
                />
              )}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload New Main Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="hidden"
                  id="mainImage"
                />
                <label htmlFor="mainImage" className="cursor-pointer flex flex-col items-center">
                  <FiImage className="text-gray-400 text-3xl mb-2" />
                  <span className="text-sm text-gray-600">
                    {mainImage ? mainImage.name : 'Click to upload new main image'}
                  </span>
                </label>
              </div>
            </div>

            {/* Existing Secondary Images */}
            {existingSecondaryImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Secondary Images
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingSecondaryImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Secondary ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingSecondaryImage(imageUrl)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Secondary Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add New Secondary Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSecondaryImagesChange}
                  className="hidden"
                  id="secondaryImages"
                />
                <label htmlFor="secondaryImages" className="cursor-pointer flex flex-col items-center">
                  <FiUpload className="text-gray-400 text-3xl mb-2" />
                  <span className="text-sm text-gray-600">
                    {secondaryImages.length > 0 
                      ? `${secondaryImages.length} new images selected` 
                      : 'Click to upload additional secondary images'
                    }
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
