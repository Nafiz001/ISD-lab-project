import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let q = collection(db, 'products');

        // Apply filters
        if (filters.category) {
          q = query(q, where('category', '==', filters.category));
        }
        
        // Add ordering if specified
        if (filters.orderBy) {
          try {
            q = query(q, orderBy(filters.orderBy, filters.order || 'desc'));
          } catch (orderError) {
            console.warn(`Cannot order by ${filters.orderBy}, fetching without ordering:`, orderError);
          }
        }
        
        // Add limit if specified
        if (filters.limit) {
          q = query(q, limit(filters.limit));
        }

        const querySnapshot = await getDocs(q);
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });

        // If we have an orderBy filter but couldn't apply it in the query, sort in memory
        if (filters.orderBy && productsData.length > 0) {
          productsData.sort((a, b) => {
            const aValue = a[filters.orderBy] || 0;
            const bValue = b[filters.orderBy] || 0;
            const order = filters.order || 'desc';
            
            if (order === 'desc') {
              return bValue - aValue;
            } else {
              return aValue - bValue;
            }
          });
          
          // Apply limit after sorting if needed
          if (filters.limit && productsData.length > filters.limit) {
            productsData.splice(filters.limit);
          }
        }

        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.limit, filters.order, filters.orderBy]);

  return { products, loading, error };
};
