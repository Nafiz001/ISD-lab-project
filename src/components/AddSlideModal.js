import React, { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import toast from 'react-hot-toast';

const AddSlideModal = ({ onClose, onSlideAdded, products }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    linkType: 'product', // 'product', 'category', 'custom'
    selectedProduct: '',
    selectedCategory: '',
    customLink: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = ['Mobile Phone', 'Computer', 'Smartwatch', 'Camera', 'Headphones', 'Gaming'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateLink = () => {
    if (formData.linkType === 'product' && formData.selectedProduct) {
      return `/product/${formData.selectedProduct}`;
    } else if (formData.linkType === 'category' && formData.selectedCategory) {
      return `/category/${formData.selectedCategory.toLowerCase().replace(' ', '-')}`;
    } else if (formData.linkType === 'custom' && formData.customLink) {
      return formData.customLink;
    }
    return '/'; // Default to home page instead of empty string
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    // Validate link configuration
    if (formData.linkType === 'product' && !formData.selectedProduct) {
      toast.error('Please select a product or change link type');
      return;
    }
    if (formData.linkType === 'category' && !formData.selectedCategory) {
      toast.error('Please select a category or change link type');
      return;
    }
    if (formData.linkType === 'custom' && !formData.customLink) {
      toast.error('Please enter a custom link or change link type');
      return;
    }

    setUploading(true);
    try {
      // Upload image
      const imageRef = ref(storage, `carousel/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Generate the link
      const generatedLink = generateLink();
      console.log('Generated link:', generatedLink);
      console.log('Form data:', formData);

      // Prepare slide data
      const slideData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: imageUrl,
        link: generatedLink,
        order: parseInt(formData.order),
        isActive: formData.isActive
      };

      console.log('Slide data being saved:', slideData);
      await onSlideAdded(slideData);
      toast.success('Slide added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.error('Failed to add slide');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add Carousel Slide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Image *
              </label>
              {imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                  />
                  <div className="mt-4 space-x-4">
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                      <FiUpload className="mr-2" />
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Upload carousel image
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG up to 10MB (Recommended: 1200x400px)
                    </p>
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                      <FiUpload className="mr-2" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Summer Sale"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Up to 50% off"
              />
            </div>

            {/* Link Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Type
              </label>
              <select
                name="linkType"
                value={formData.linkType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="product">Link to Product</option>
                <option value="category">Link to Category</option>
                <option value="custom">Custom Link</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Conditional Link Selection */}
            {formData.linkType === 'product' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  name="selectedProduct"
                  value={formData.selectedProduct || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.linkType === 'category' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category
                </label>
                <select
                  name="selectedCategory"
                  value={formData.selectedCategory || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Choose a category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.linkType === 'custom' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Link
                </label>
                <input
                  type="text"
                  name="customLink"
                  value={formData.customLink || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., /special-offers"
                />
              </div>
            )}

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (display in carousel)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {uploading ? 'Adding...' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSlideModal;
