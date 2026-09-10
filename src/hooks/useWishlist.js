import { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../api/config';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('organic_wishlist')) || [];
    } catch (e) {
      return [];
    }
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    localStorage.setItem('organic_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    let customerUser = null;
    try {
      customerUser = JSON.parse(localStorage.getItem('customerUser'));
    } catch (e) {}

    if (customerUser && customerUser.id) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        fetch(getApiUrl(`/api/wishlist?user_id=${customerUser.id}`), {
          headers: { 'x-user-id': String(customerUser.id) }
        })
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.items) && data.items.length > 0) {
              setWishlist(data.items);
            }
          })
          .catch(() => {});
      }
    }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist
  };
};
