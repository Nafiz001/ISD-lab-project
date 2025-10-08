import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    
    // Show success message
    toast.success('Your message has been sent successfully!');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-600 mb-8">
        <span>Home</span>
        <span>/</span>
        <span className="text-black">Contact</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Call To Us */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <FiPhone className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-lg">Call To Us</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>We are available 24/7, 7 days a week.</p>
                <p className="font-medium text-black">Phone: +8801611112222</p>
              </div>
            </div>

            <hr className="my-6" />

            {/* Write To Us */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <FiMail className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-lg">Write To Us</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Fill out our form and we will contact you within 24 hours.</p>
                <p className="font-medium text-black">Emails: customer@exclusive.com</p>
                <p className="font-medium text-black">Emails: support@exclusive.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="mt-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <FiMapPin className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-lg">Visit Us</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>111 Bijoy sarani, Dhaka, DH 1515, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone *"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-100 rounded border-0 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-500 text-white px-8 py-3 rounded hover:bg-red-600 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section (Optional) */}
      <div className="mt-12">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-500">Map integration can be added here (Google Maps, etc.)</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
