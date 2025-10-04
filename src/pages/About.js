import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

// Import service icons
import fastDeliveryIcon from '../assets/contact/fast-delivery.png';
import customerServiceIcon from '../assets/contact/customer_sevice.png';
import moneyBackIcon from '../assets/contact/check-mark.png';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching about data from Firebase...');
      console.log('Database object:', db);
      
      // Fetch about page content
      const aboutDoc = await getDoc(doc(db, 'pages', 'about'));
      if (aboutDoc.exists()) {
        console.log('About document found:', aboutDoc.data());
        setAboutData(aboutDoc.data());
      } else {
        console.log('No about document found, using default data');
        // Set default data if no document exists
        setAboutData({
          title: 'Our Story',
          description: [
            'Launched in 2015, Exclusive is South Asia\'s premier online shopping marketplace with an active presence in Bangladesh. Supported by wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sellers and 300 brands and serves 3 million customers across the region.',
            'Exclusive has more than 1 Million products to offer, growing at a very fast. Exclusive offers a diverse assortment in categories ranging from consumer.'
          ],
          image: '/about-story.jpg'
        });
      }

      // Fetch statistics
      const statsSnapshot = await getDocs(collection(db, 'about-statistics'));
      if (!statsSnapshot.empty) {
        const statsData = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Statistics found:', statsData);
        setStatistics(statsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        console.log('No statistics found, statistics will be empty');
      }

      // Fetch team members
      const teamSnapshot = await getDocs(collection(db, 'team-members'));
      if (!teamSnapshot.empty) {
        const teamData = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Team members found:', teamData);
        setTeamMembers(teamData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        console.log('No team members found, team section will be empty');
      }

      console.log('About data fetching completed successfully');
    } catch (error) {
      console.error('Error fetching about data:', error);
      setError(error.message);
      
      // Set fallback data even if there's an error
      if (!aboutData) {
        setAboutData({
          title: 'Our Story',
          description: [
            'Launched in 2015, Exclusive is South Asia\'s premier online shopping marketplace with an active presence in Bangladesh. Supported by wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sellers and 300 brands and serves 3 million customers across the region.',
            'Exclusive has more than 1 Million products to offer, growing at a very fast. Exclusive offers a diverse assortment in categories ranging from consumer.'
          ],
          image: '/about-story.jpg'
        });
      }
      
      if (statistics.length === 0) {
        console.log('Statistics will remain empty due to error');
      }
      
      if (teamMembers.length === 0) {
        console.log('Team members will remain empty due to error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <strong>Notice:</strong> Loading from database failed ({error}). Showing default content.
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-600 mb-8">
        <span>Home</span>
        <span>/</span>
        <span className="text-black">About</span>
      </div>

      {/* Our Story Section */}
      {aboutData && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl font-bold mb-6">{aboutData.title}</h1>
            <div className="space-y-4 text-gray-600">
              {aboutData.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src={aboutData.image}
              alt={aboutData.title}
              className="w-full max-w-md rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        </section>
      )}

      {/* Statistics Section */}
      {statistics.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statistics.map((stat) => (
            <div 
              key={stat.id} 
              className="text-center p-6 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 flex justify-center items-center">
                {stat.image ? (
                  <img 
                    src={stat.image} 
                    alt={stat.label}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <span>{stat.icon}</span>
                )}
              </div>
              <div className="text-2xl font-bold mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 group-hover:text-white">{stat.label}</div>
            </div>
          ))}
        </section>
      )}

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.jpg';
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-600 mb-3">{member.role}</p>
                {member.social && (
                  <div className="flex justify-center space-x-3">
                    {member.social.twitter && (
                      <a href={member.social.twitter} className="text-gray-400 hover:text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </a>
                    )}
                    {member.social.instagram && (
                      <a href={member.social.instagram} className="text-gray-400 hover:text-pink-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.349-1.051-2.349-2.348 0-1.297 1.052-2.349 2.349-2.349 1.296 0 2.348 1.052 2.348 2.349 0 1.297-1.052 2.348-2.348 2.348zm7.718 0c-1.297 0-2.349-1.051-2.349-2.348 0-1.297 1.052-2.349 2.349-2.349 1.297 0 2.348 1.052 2.348 2.349 0 1.297-1.051 2.348-2.348 2.348z"/>
                        </svg>
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      <section>
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

export default About;
